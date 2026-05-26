import { basename, dirname, normalize, resolve as resolvePath, splitPath } from './path'
import {
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  type Vfs,
  type VfsDirectory,
  type VfsErrorCode,
  type VfsFile,
  type VfsNode,
  type VfsResult,
} from './types'

function ok<T>(value: T): VfsResult<T> {
  return { ok: true, value }
}

function err(code: VfsErrorCode, message: string, path?: string): VfsResult<never> {
  return { ok: false, error: { code, message, path } }
}

function isDirectory(node: VfsNode): node is VfsDirectory {
  return node.type === 'directory'
}

function isFile(node: VfsNode): node is VfsFile {
  return node.type === 'file'
}

function now(): number {
  return Date.now()
}

function createEmptyDirectory(name: string): VfsDirectory {
  return { type: 'directory', name, mtime: now(), mode: DEFAULT_DIR_MODE, children: {} }
}

function createFile(name: string, content: string): VfsFile {
  return { type: 'file', name, mtime: now(), mode: DEFAULT_FILE_MODE, content }
}

function cloneNode(node: VfsNode, newName: string): VfsNode {
  if (isDirectory(node)) {
    const cloned: VfsDirectory = {
      type: 'directory',
      name: newName,
      mtime: now(),
      mode: node.mode,
      children: {},
    }
    for (const [childName, child] of Object.entries(node.children)) {
      cloned.children[childName] = cloneNode(child, childName)
    }
    return cloned
  }
  return {
    type: 'file',
    name: newName,
    mtime: now(),
    mode: node.mode,
    content: node.content,
  }
}

function isValidNode(value: unknown): value is VfsNode {
  if (!value || typeof value !== 'object') return false
  const node = value as Record<string, unknown>
  if (node.type !== 'directory' && node.type !== 'file') return false
  if (typeof node.name !== 'string') return false
  if (typeof node.mtime !== 'number') return false
  if (typeof node.mode !== 'number') return false
  if (node.type === 'directory') {
    if (!node.children || typeof node.children !== 'object') return false
    for (const child of Object.values(node.children)) {
      if (!isValidNode(child)) return false
    }
    return true
  }
  return typeof node.content === 'string'
}

class VfsImpl implements Vfs {
  private root: VfsDirectory

  constructor(initial?: VfsDirectory) {
    this.root = initial ?? createEmptyDirectory('/')
  }

  resolve(cwd: string, path: string): string {
    return resolvePath(cwd, path)
  }

  private getNode(absPath: string): VfsResult<VfsNode> {
    const normalized = normalize(absPath)
    if (normalized === '/') return ok(this.root)
    const segments = splitPath(normalized)
    let current: VfsNode = this.root
    let traveled = ''
    for (const seg of segments) {
      if (!isDirectory(current)) {
        return err('ENOTDIR', 'Not a directory', traveled || normalized)
      }
      const next: VfsNode | undefined = current.children[seg]
      if (!next) {
        return err('ENOENT', 'No such file or directory', normalized)
      }
      traveled += `/${seg}`
      current = next
    }
    return ok(current)
  }

  stat(path: string): VfsResult<VfsNode> {
    return this.getNode(path)
  }

  list(path: string): VfsResult<VfsNode[]> {
    const result = this.getNode(path)
    if (!result.ok) return result
    if (!isDirectory(result.value)) {
      return err('ENOTDIR', 'Not a directory', path)
    }
    return ok(Object.values(result.value.children))
  }

  readFile(path: string): VfsResult<string> {
    const result = this.getNode(path)
    if (!result.ok) return result
    if (!isFile(result.value)) {
      return err('EISDIR', 'Is a directory', path)
    }
    return ok(result.value.content)
  }

  writeFile(path: string, content: string): VfsResult<void> {
    const normalized = normalize(path)
    if (normalized === '/') {
      return err('EISDIR', 'Is a directory', path)
    }
    const parentPath = dirname(normalized)
    const filename = basename(normalized)
    const parentResult = this.getNode(parentPath)
    if (!parentResult.ok) return parentResult
    if (!isDirectory(parentResult.value)) {
      return err('ENOTDIR', 'Not a directory', parentPath)
    }
    const existing = parentResult.value.children[filename]
    if (existing && isDirectory(existing)) {
      return err('EISDIR', 'Is a directory', path)
    }
    parentResult.value.children[filename] = createFile(filename, content)
    parentResult.value.mtime = now()
    return ok(undefined)
  }

  appendFile(path: string, content: string): VfsResult<void> {
    const existingResult = this.getNode(path)
    if (existingResult.ok) {
      if (!isFile(existingResult.value)) {
        return err('EISDIR', 'Is a directory', path)
      }
      existingResult.value.content += content
      existingResult.value.mtime = now()
      return ok(undefined)
    }
    if (existingResult.error.code !== 'ENOENT') return existingResult
    return this.writeFile(path, content)
  }

  mkdir(path: string, opts?: { recursive?: boolean }): VfsResult<void> {
    const recursive = opts?.recursive ?? false
    const normalized = normalize(path)
    if (normalized === '/') {
      return recursive ? ok(undefined) : err('EEXIST', 'File exists', path)
    }
    const segments = splitPath(normalized)
    let current: VfsDirectory = this.root
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const isLast = i === segments.length - 1
      const existing = current.children[seg]
      if (existing) {
        if (!isDirectory(existing)) {
          // 末尾セグメントがファイルなら EEXIST (実 mkdir の挙動)
          if (isLast) {
            return err('EEXIST', 'File exists', path)
          }
          return err('ENOTDIR', 'Not a directory', `/${segments.slice(0, i + 1).join('/')}`)
        }
        if (isLast && !recursive) {
          return err('EEXIST', 'File exists', path)
        }
        current = existing
      } else {
        if (!isLast && !recursive) {
          return err(
            'ENOENT',
            'No such file or directory',
            `/${segments.slice(0, i + 1).join('/')}`,
          )
        }
        const newDir = createEmptyDirectory(seg)
        current.children[seg] = newDir
        current.mtime = now()
        current = newDir
      }
    }
    return ok(undefined)
  }

  remove(path: string, opts?: { recursive?: boolean }): VfsResult<void> {
    const normalized = normalize(path)
    if (normalized === '/') {
      return err('EINVAL', 'Cannot remove root', path)
    }
    const recursive = opts?.recursive ?? false
    const parentPath = dirname(normalized)
    const filename = basename(normalized)
    const parentResult = this.getNode(parentPath)
    if (!parentResult.ok) return parentResult
    if (!isDirectory(parentResult.value)) {
      return err('ENOTDIR', 'Not a directory', parentPath)
    }
    const target = parentResult.value.children[filename]
    if (!target) {
      return err('ENOENT', 'No such file or directory', path)
    }
    if (isDirectory(target) && !recursive) {
      return err('EISDIR', 'Is a directory', path)
    }
    delete parentResult.value.children[filename]
    parentResult.value.mtime = now()
    return ok(undefined)
  }

  removeDir(path: string): VfsResult<void> {
    const normalized = normalize(path)
    if (normalized === '/') {
      return err('EINVAL', 'Cannot remove root', path)
    }
    const parentPath = dirname(normalized)
    const filename = basename(normalized)
    const parentResult = this.getNode(parentPath)
    if (!parentResult.ok) return parentResult
    if (!isDirectory(parentResult.value)) {
      return err('ENOTDIR', 'Not a directory', parentPath)
    }
    const target = parentResult.value.children[filename]
    if (!target) {
      return err('ENOENT', 'No such file or directory', path)
    }
    if (!isDirectory(target)) {
      return err('ENOTDIR', 'Not a directory', path)
    }
    if (Object.keys(target.children).length > 0) {
      return err('ENOTEMPTY', 'Directory not empty', path)
    }
    delete parentResult.value.children[filename]
    parentResult.value.mtime = now()
    return ok(undefined)
  }

  move(src: string, dst: string): VfsResult<void> {
    const srcNorm = normalize(src)
    const dstNorm = normalize(dst)
    if (srcNorm === '/') return err('EINVAL', 'Cannot move root', src)
    if (srcNorm === dstNorm) {
      return err('EINVAL', `'${src}' and '${dst}' are the same file`, src)
    }

    const srcParentPath = dirname(srcNorm)
    const srcName = basename(srcNorm)
    const srcParentResult = this.getNode(srcParentPath)
    if (!srcParentResult.ok) return srcParentResult
    if (!isDirectory(srcParentResult.value)) {
      return err('ENOTDIR', 'Not a directory', srcParentPath)
    }
    const srcNode = srcParentResult.value.children[srcName]
    if (!srcNode) return err('ENOENT', 'No such file or directory', src)

    if (isDirectory(srcNode) && dstNorm.startsWith(`${srcNorm}/`)) {
      return err('EINVAL', `Cannot move '${src}' into itself`, src)
    }

    const dstResult = this.getNode(dstNorm)
    let dstParent: VfsDirectory
    let dstName: string
    if (dstResult.ok && isDirectory(dstResult.value)) {
      dstParent = dstResult.value
      dstName = srcName
    } else {
      const dstParentPath = dirname(dstNorm)
      dstName = basename(dstNorm)
      if (dstName === '/') return err('EINVAL', 'Invalid destination', dst)
      const dstParentResult = this.getNode(dstParentPath)
      if (!dstParentResult.ok) return dstParentResult
      if (!isDirectory(dstParentResult.value)) {
        return err('ENOTDIR', 'Not a directory', dstParentPath)
      }
      dstParent = dstParentResult.value
    }

    const existing = dstParent.children[dstName]
    if (existing) {
      if (isDirectory(existing) && !isDirectory(srcNode)) {
        return err('EISDIR', 'Is a directory', dst)
      }
      if (!isDirectory(existing) && isDirectory(srcNode)) {
        return err('ENOTDIR', 'Not a directory', dst)
      }
      if (
        isDirectory(existing) &&
        isDirectory(srcNode) &&
        Object.keys(existing.children).length > 0
      ) {
        return err('ENOTEMPTY', 'Directory not empty', dst)
      }
    }

    delete srcParentResult.value.children[srcName]
    srcParentResult.value.mtime = now()
    // mv は同一 FS 内なら mtime を保持する (rename(2) は metadata に触らない)
    const movedNode: VfsNode = { ...srcNode, name: dstName }
    dstParent.children[dstName] = movedNode
    dstParent.mtime = now()
    return ok(undefined)
  }

  copy(src: string, dst: string, opts?: { recursive?: boolean }): VfsResult<void> {
    const recursive = opts?.recursive ?? false
    const srcNorm = normalize(src)
    const dstNorm = normalize(dst)
    if (srcNorm === dstNorm) {
      return err('EINVAL', `'${src}' and '${dst}' are the same file`, src)
    }

    const srcResult = this.getNode(srcNorm)
    if (!srcResult.ok) return srcResult

    if (isDirectory(srcResult.value) && !recursive) {
      return err('EISDIR', 'Is a directory', src)
    }

    if (isDirectory(srcResult.value) && dstNorm.startsWith(`${srcNorm}/`)) {
      return err('EINVAL', `Cannot copy '${src}' into itself`, src)
    }

    const dstResult = this.getNode(dstNorm)
    let dstParent: VfsDirectory
    let dstName: string
    if (dstResult.ok && isDirectory(dstResult.value)) {
      dstParent = dstResult.value
      dstName = basename(srcNorm)
    } else {
      const dstParentPath = dirname(dstNorm)
      dstName = basename(dstNorm)
      if (dstName === '/') return err('EINVAL', 'Invalid destination', dst)
      const dstParentResult = this.getNode(dstParentPath)
      if (!dstParentResult.ok) return dstParentResult
      if (!isDirectory(dstParentResult.value)) {
        return err('ENOTDIR', 'Not a directory', dstParentPath)
      }
      dstParent = dstParentResult.value
    }

    const existingDst = dstParent.children[dstName]
    if (existingDst) {
      if (isDirectory(existingDst) && !isDirectory(srcResult.value)) {
        return err('EISDIR', 'Is a directory', dst)
      }
      if (!isDirectory(existingDst) && isDirectory(srcResult.value)) {
        return err('ENOTDIR', 'cannot overwrite non-directory with directory', dst)
      }
      if (
        isDirectory(existingDst) &&
        isDirectory(srcResult.value) &&
        Object.keys(existingDst.children).length > 0
      ) {
        return err('ENOTEMPTY', 'Directory not empty', dst)
      }
    }

    dstParent.children[dstName] = cloneNode(srcResult.value, dstName)
    dstParent.mtime = now()
    return ok(undefined)
  }

  serialize(): string {
    return JSON.stringify(this.root)
  }

  loadFromSerialized(json: string): VfsResult<void> {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch (_e) {
      return err('EINVAL', 'Failed to parse serialized VFS data')
    }
    if (!isValidNode(parsed) || parsed.type !== 'directory') {
      return err('EINVAL', 'Invalid serialized VFS data')
    }
    this.root = parsed
    return ok(undefined)
  }
}

export function createVfs(initial?: VfsDirectory): Vfs {
  return new VfsImpl(initial)
}
