export interface Token {
  type:
    | "keyword"
    | "string"
    | "comment"
    | "function"
    | "builtin"
    | "number"
    | "decorator"
    | "operator"
    | "class"
    | "plain"
  value: string
}

const PYTHON_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await",
  "break", "class", "continue", "def", "del", "elif", "else", "except",
  "finally", "for", "from", "global", "if", "import", "in", "is",
  "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
  "try", "while", "with", "yield",
])

const PYTHON_BUILTINS = new Set([
  "print", "len", "range", "str", "int", "float", "bool", "list",
  "dict", "set", "tuple", "type", "isinstance", "hasattr", "getattr",
  "setattr", "open", "input", "enumerate", "zip", "map", "filter",
  "sorted", "reversed", "sum", "min", "max", "abs", "round",
  "FastAPI", "BaseModel", "Field", "Optional", "List", "Union",
  "Session", "select", "Depends", "HTTPException", "status",
  "APIRouter", "Request", "Response", "BackgroundTasks",
])

export function highlightPython(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < code.length) {
    // Comment
    if (code[i] === "#") {
      let j = i
      while (j < code.length && code[j] !== "\n") j++
      tokens.push({ type: "comment", value: code.slice(i, j) })
      i = j
      continue
    }

    // Triple-quoted string
    if (code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''") {
      const q = code.slice(i, i + 3)
      let j = i + 3
      while (j < code.length && code.slice(j, j + 3) !== q) j++
      j += 3
      tokens.push({ type: "string", value: code.slice(i, j) })
      i = j
      continue
    }

    // Single/double quoted string
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== q && code[j] !== "\n") {
        if (code[j] === "\\") j++
        j++
      }
      j++
      tokens.push({ type: "string", value: code.slice(i, j) })
      i = j
      continue
    }

    // Decorator
    if (code[i] === "@") {
      let j = i + 1
      while (j < code.length && /[\w.]/.test(code[j])) j++
      tokens.push({ type: "decorator", value: code.slice(i, j) })
      i = j
      continue
    }

    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === "-" && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i
      if (code[j] === "-") j++
      while (j < code.length && /[0-9._xXbBoO]/.test(code[j])) j++
      tokens.push({ type: "number", value: code.slice(i, j) })
      i = j
      continue
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++
      const word = code.slice(i, j)

      // Check if followed by '(' — it's a function/class call
      const after = code.slice(j).trimStart()
      if (PYTHON_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word })
      } else if (PYTHON_BUILTINS.has(word)) {
        tokens.push({ type: "builtin", value: word })
      } else if (after.startsWith("(")) {
        // Class definition
        if (tokens.length > 0) {
          const prev = tokens.filter(t => t.type !== "plain" || t.value.trim()).slice(-1)[0]
          if (prev?.value === "class") {
            tokens.push({ type: "class", value: word })
            i = j
            continue
          }
        }
        tokens.push({ type: "function", value: word })
      } else if (word[0] === word[0].toUpperCase() && word.length > 1) {
        tokens.push({ type: "class", value: word })
      } else {
        tokens.push({ type: "plain", value: word })
      }
      i = j
      continue
    }

    // Operator
    if (/[+\-*/%=<>!&|^~]/.test(code[i])) {
      let j = i + 1
      if (j < code.length && /[=<>&|]/.test(code[j])) j++
      tokens.push({ type: "operator", value: code.slice(i, j) })
      i = j
      continue
    }

    // Plain character (whitespace, punctuation, etc.)
    tokens.push({ type: "plain", value: code[i] })
    i++
  }

  return tokens
}

export function highlightBash(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  const BASH_KEYWORDS = new Set([
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done",
    "case", "esac", "function", "in", "return", "exit", "export",
    "source", "echo", "cd", "ls", "mkdir", "rm", "cp", "mv",
  ])

  while (i < code.length) {
    // Comment
    if (code[i] === "#") {
      let j = i
      while (j < code.length && code[j] !== "\n") j++
      tokens.push({ type: "comment", value: code.slice(i, j) })
      i = j
      continue
    }

    // String
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== q) {
        if (code[j] === "\\") j++
        j++
      }
      j++
      tokens.push({ type: "string", value: code.slice(i, j) })
      i = j
      continue
    }

    // Flags (--flag or -f)
    if (code[i] === "-" && (code[i+1] === "-" || /[a-zA-Z]/.test(code[i+1] || ""))) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_\-]/.test(code[j])) j++
      tokens.push({ type: "decorator", value: code.slice(i, j) })
      i = j
      continue
    }

    // Variable
    if (code[i] === "$") {
      let j = i + 1
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++
      tokens.push({ type: "builtin", value: code.slice(i, j) })
      i = j
      continue
    }

    // Word/command
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_\-.]/.test(code[j])) j++
      const word = code.slice(i, j)
      if (BASH_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word })
      } else if (tokens.length === 0 || tokens.every(t => t.value === "\n" || t.value === " " || t.value === "\t" || t.value.endsWith("\n"))) {
        tokens.push({ type: "function", value: word })
      } else {
        tokens.push({ type: "plain", value: word })
      }
      i = j
      continue
    }

    tokens.push({ type: "plain", value: code[i] })
    i++
  }

  return tokens
}

export function highlight(code: string, language: string): Token[] {
  if (language === "python") return highlightPython(code)
  if (language === "bash" || language === "sh") return highlightBash(code)
  return [{ type: "plain", value: code }]
}

export const TOKEN_COLORS: Record<Token["type"], string> = {
  keyword: "#ff7b72",
  string: "#a5d6ff",
  comment: "#8b949e",
  function: "#d2a8ff",
  builtin: "#009688",
  number: "#ffa657",
  decorator: "#26A69A",
  operator: "#ff7b72",
  class: "#ffa657",
  plain: "#e6edf3",
}
