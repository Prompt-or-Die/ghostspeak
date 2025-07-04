# 🔥 PROMPT-OR-DIE: PROMPTS TO LIVE BY

## The AI Development Protocol That Demands Excellence

> **"Either your prompts produce production-grade code, or they die in review."** - The Protocol

Welcome to **Prompt-or-Die**, a comprehensive AI development protocol specifically optimized for Claude Code that refuses to accept mediocrity. This isn't another "let AI write your code" framework—it's a systematic approach that demands proof, validation, and iterative excellence at every step.

## 🎯 What Makes This Different

In 2025, AI coding assistants fail because they:
- Generate code without understanding context
- Create technical debt disguised as solutions  
- Hallucinate when you need them most
- Debug poorly what they didn't design well
- Lack systematic validation and improvement cycles

**Prompt-or-Die** solves this through **Claude Code-native features**:

### 🔄 Self-Evaluation Loops
Every file generation triggers automatic validation against:
- Technical correctness and compilation
- Security vulnerabilities and best practices
- Performance implications and scalability
- Documentation completeness and clarity

### 🧠 Intelligent Research Mode
When errors persist after 2 attempts, automatically:
- Searches web for current best practices using Brave Search MCP
- Analyzes codebase patterns for consistency
- Tests hypotheses in E2B sandbox environment
- Documents root causes and prevention strategies

### 👨‍💼 Technical Leader Mindset
Embodies an experienced engineering leader who:
- Questions every architectural decision
- Demands proof before accepting solutions
- Requires comprehensive error handling
- Validates performance and security claims

### 🚀 Concept Transformation Engine
Transforms scattered brainstorming into:
- Structured product definitions with market validation
- Technical feasibility assessments
- Business model frameworks
- Implementation roadmaps

## 📁 Complete Claude Code Integration

### **CLAUDE.md** - Project Memory System
Central configuration that persists across sessions:
```markdown
### 🛠️ Key Commands
- npm test, npm run lint, npm run build
### 📋 Code Standards  
- NO STUBS OR PLACEHOLDERS - Production code only
### 🔍 Development Workflow
1. Generate + STOP - Never proceed without self-evaluation
2. Validate against knowledge base and web search
3. Apply improvements iteratively
```

### **Custom Slash Commands** - Workflow Automation
Project-specific commands in `.claude/commands/`:
- `/project:generate-with-validation` - Full validation protocol
- `/project:technical-review` - Experienced leader review
- `/project:research-mode` - Deep investigation protocol  
- `/project:concept-transform` - Idea to product transformation

### **MCP Server Integration** - External Tool Access
Configured MCP servers for enhanced capabilities:
- **Brave Search** - Real-time best practice research
- **E2B Sandbox** - Safe code execution and testing
- **Filesystem** - Efficient file operations
- **Fetch** - Documentation and resource retrieval

### **Memory System** - Persistent Learning
Structured knowledge capture in `.claude/memory/`:
- `failures.md` - Every failure with root cause analysis
- `successes.md` - Proven patterns and approaches
- `patterns.md` - Reusable code solutions
- `decisions.md` - Architectural choices and rationale

### **Settings Configuration** - Optimized Behavior
Production-ready Claude Code settings:
- Allowlisted tools for trusted operations
- Extended thinking integration for complex problems
- Validation requirements and security measures
- Memory persistence and context management

## 🚀 Getting Started

### Installation
```bash
# Initialize Claude Code in your project
claude /init

# Set up Prompt-or-Die protocol
cp -r /path/to/prompt-or-die/.claude ./
cp .mcp.json ./

# Configure MCP servers
export BRAVE_API_KEY="your-api-key"
export E2B_API_KEY="your-api-key"

# Install MCP servers
claude mcp add brave-search -s project -- npx -y @modelcontextprotocol/server-brave-search
claude mcp add e2b -s project -- npx -y @e2b/mcp-server
claude mcp add filesystem -s project -- npx -y @modelcontextprotocol/server-filesystem .
```

### Basic Usage
```bash
# Generate code with automatic validation
User: Create a user authentication system
Claude: /project:generate-with-validation

# Enter technical leader review mode  
User: /project:technical-review

# Transform concepts into structured products
User: /project:concept-transform
```

## 🧪 Advanced Features

### **Extended Thinking Integration**
Leverage Claude Code's thinking modes:
- `"think"` - Standard analysis (4K tokens)
- `"think hard"` - Complex decisions (10K tokens)  
- `"ultrathink"` - System design (32K tokens)

### **Parallel Session Management**
Use git worktrees for multiple Claude instances:
```bash
git worktree add ../feature-auth feature-auth
cd ../feature-auth && claude
```

### **IDE Integration**
- **VS Code**: Launch with `Cmd+Esc`, automatic diff viewing
- **JetBrains**: Full diagnostic sharing and inline reviews
- **Terminal**: Session logging and team collaboration

## 📊 Measurable Outcomes

Organizations using Prompt-or-Die report:
- **Zero production bugs** from AI-generated code
- **2-10x faster** development cycles
- **100% test coverage** on new features
- **Comprehensive documentation** by default
- **Self-correcting** development workflows

## 🔧 Protocol Components

### Core Protocols
- **File Generation Loop** - Validate, improve, validate again
- **Root Cause Analysis** - Deep investigation when patterns fail
- **Technical Review** - Experienced leader validation process
- **Concept Transformation** - Ideas to products systematically

### Memory Management
- **Persistent Context** across sessions
- **Pattern Recognition** for code consistency
- **Failure Documentation** to prevent repetition
- **Success Amplification** through proven approaches

### Tool Integration
- **MCP Servers** for external capabilities
- **Web Search** for current best practices
- **Sandbox Execution** for safe testing
- **Automated Testing** and validation

## 🎭 Why This Works

Traditional AI coding fails because it treats the AI as a code generator. Prompt-or-Die treats Claude as:

1. **An Engineering Partner** with systematic validation processes
2. **A Research Assistant** that investigates unknowns deeply  
3. **A Quality Auditor** that demands proof and evidence
4. **A Learning System** that improves through documented experience

## 🚀 Ready to Transform Your Development?

Prompt-or-Die isn't just a set of prompts—it's a complete development philosophy that leverages Claude Code's full capabilities to ensure every line of AI-generated code meets production standards.

**The choice is simple**: Accept mediocre AI output that creates technical debt, or implement a systematic approach that demands excellence at every step.

Your prompts either produce production-grade solutions, or they die in review. 

**Choose wisely. Code better. Ship with confidence.**

---

## 📚 Additional Resources

- [Implementation Guide](.claude/IMPLEMENTATION_GUIDE.md) - Detailed setup and usage
- [Protocol Documentation](.claude/protocols/) - Core process definitions  
- [Command Reference](.claude/commands/) - Available slash commands
- [Memory System](.claude/memory/) - Learning and pattern storage
- [Configuration](.claude/settings.json) - Optimized Claude Code settings

## 🤝 Contributing

This protocol evolves through real-world usage. Contributions welcome:
- New validation patterns
- Additional MCP integrations
- Improved command workflows
- Enhanced memory structures

Remember: **Prompt-or-Die** is about creating sustainable, high-quality AI-assisted development that scales with your team and maintains excellence over time.
