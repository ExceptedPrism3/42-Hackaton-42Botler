/**
 * 42 Heilbronn Comprehensive Knowledge & Project Guide
 * Contains deep technical knowledge for Common Core, Piscine, and Campus Life.
 */

const CURRICULUM_DATABASE = {
  // --- RANK 0 ---
  libft: {
    title: 'Libft — Your First C Library',
    content: `📚 **Libft (Rank 00 Project)**:
Your objective is to re-code standard C library functions and create custom utility helpers.

**Key Components**:
1. **Part 1 (Libc Functions)**: \`ft_isalpha\`, \`ft_isdigit\`, \`ft_strlen\`, \`ft_memset\`, \`ft_bzero\`, \`ft_memcpy\`, \`ft_memmove\`, \`ft_strlcpy\`, \`ft_strlcat\`, \`ft_toupper\`, \`ft_tolower\`, \`ft_strchr\`, \`ft_strrchr\`, \`ft_strncmp\`, \`ft_memchr\`, \`ft_memcmp\`, \`ft_strnstr\`, \`ft_atoi\`, \`ft_calloc\`, \`ft_strdup\`.
2. **Part 2 (Additional Functions)**: \`ft_substr\`, \`ft_strjoin\`, \`ft_strtrim\`, \`ft_split\`, \`ft_itoa\`, \`ft_strmapi\`, \`ft_striteri\`, \`ft_putchar_fd\`, \`ft_putstr_fd\`, \`ft_putendl_fd\`, \`ft_putnbr_fd\`.
3. **Bonus (Linked Lists)**: \`t_list\` struct, \`ft_lstnew\`, \`ft_lstadd_front\`, \`ft_lstsize\`, \`ft_lstlast\`, \`ft_lstadd_back\`, \`ft_lstdelone\`, \`ft_lstclear\`, \`ft_lstiter\`, \`ft_lstmap\`.

**Common Pitfalls**:
• Forgetting to free allocated memory on \`ft_split\` failure.
• \`ft_memmove\` overlap handling (copy backwards if \`dest > src\`).
• Makefile must support \`all\`, \`clean\`, \`fclean\`, \`re\`, and \`bonus\` without relinking.

[? How does ft_split work? ?] [? Norminette rules for libft ?] [? Peer evaluation tips ?]`
  },

  // --- RANK 1 ---
  ft_printf: {
    title: 'ft_printf — Variadic Functions & Format Specifiers',
    content: `🖨️ **ft_printf (Rank 01 Project)**:
Recreate the behavior of the standard \`printf\` using variadic arguments.

**Mandatory Conversions**:
• \`%c\` : Single character
• \`%s\` : String (handle \`(null)\` correctly)
• \`%p\` : Void pointer formatted in hexadecimal (\`0x...\`, handle \`(nil)\` / \`0x0\`)
• \`%d\` / \`%i\` : Signed integer in base 10
• \`%u\` : Unsigned decimal integer
• \`%x\` / \`%X\` : Unsigned hex integer (lowercase / uppercase)
• \`%%\` : Percent sign

**Essential Variadic Macros**:
\`\`\`c
#include <stdarg.h>

int ft_printf(const char *format, ...)
{
    va_list args;
    va_start(args, format);
    // process specifiers with va_arg(args, type)
    va_end(args);
    return (total_chars_printed);
}
\`\`\`

**Pro Tip**: Return the exact total number of characters printed, or -1 on write error.

[? Explain get_next_line ?] [? Born2beRoot guide ?] [? Norminette Checklist ?]`
  },

  get_next_line: {
    title: 'get_next_line — Reading From File Descriptors Line by Line',
    content: `📄 **get_next_line (Rank 01 Project)**:
Function that reads a line ending with a newline (\`\\n\`) or EOF from a given file descriptor (\`fd\`).

**Key Concept: Static Variable**:
\`\`\`c
char *get_next_line(int fd)
{
    static char *stash; // Persists remainder between consecutive calls
    // 1. Read buffer into stash until '\\n' or EOF is found
    // 2. Extract line up to '\\n'
    // 3. Keep remaining characters in static stash
}
\`\`\`

**Critical Checklist**:
• Must compile with flag \`-D BUFFER_SIZE=n\` (e.g. \`BUFFER_SIZE=42\`, \`1\`, \`10000000\`).
• Free all buffers on read error (\`read() < 0\`) or EOF.
• Bonus requirement: Single static variable supporting multiple file descriptors simultaneously (\`static char *stash[1024]\` or linked list).

[? Memory leak test with valgrind ?] [? Explain Born2beRoot ?] [? Push_swap algorithms ?]`
  },

  born2beroot: {
    title: 'Born2beRoot — System Administration & Debian Security',
    content: `🛡️ **Born2beRoot (Rank 01 Project)**:
Set up a secure Debian headless Linux server in VirtualBox according to strict DevOps standards.

**Key Requirements**:
1. **LVM Partitioning**: Encrypted LVM partitions with separate mounts (\`/root\`, \`/home\`, \`/var\`, \`/srv\`, \`/tmp\`, \`/var/log\`).
2. **SSH Configuration**:
   - Port changed to \`4242\` (no root login: \`PermitRootLogin no\`).
   - UFW firewall enabled and allowing only port \`4242\`: \`sudo ufw allow 4242\`.
3. **Password & Sudo Policy**:
   - Expire passwords every 30 days, min 2 days before change.
   - Sudoers configuration: Log all sudo commands to \`/var/log/sudo/sudo.log\`, limit attempts to 3.
4. **Monitoring Script (\`monitoring.sh\`)**:
   - Wall broadcast every 10 minutes using cron (\`crontab -u root -e\`).
   - Must display: OS architecture, CPU physical/virtual cores, RAM utilization, Disk utilization, CPU load %, Last reboot, LVM use (yes/no), Active connections, User count, IPv4 & MAC address, Sudo command executions.

[? How to configure monitoring.sh ?] [? Sudo password policy rules ?] [? Push_swap guide ?]`
  },

  // --- RANK 2 ---
  push_swap: {
    title: 'push_swap — Stack Sorting with Minimal Instructions',
    content: `🔄 **push_swap (Rank 02 Project)**:
Sort a stack of integers using two stacks (\`a\` and \`b\`) with a restricted set of instructions.

**Available Operations**:
• \`sa\` / \`sb\` / \`ss\`: Swap top 2 elements
• \`pa\` / \`pb\`: Push top element to other stack
• \`ra\` / \`rb\` / \`rr\`: Rotate upwards (first becomes last)
• \`rra\` / \`rrb\` / \`rrr\`: Reverse rotate (last becomes first)

**Top Sorting Algorithms**:
1. **Turk Algorithm (Mechanical Turk)**: Push elements to \`b\` in cost-calculated buckets, compute lowest move cost to position each element back into \`a\` using dual rotations (\`rr\`/\`rrr\`). (Best efficiency: ~4500 moves for 500 numbers).
2. **Chunk / Radix Sort**: Binary/bit-shifting radix sort or chunk range partitions.

**Score Limits**:
• 100 numbers: < 700 moves (5/5 pts)
• 500 numbers: < 5500 moves (5/5 pts)

[? Explain Turk Algorithm ?] [? Minishell guide ?] [? Philosophers concurrency ?]`
  },

  pipex: {
    title: 'pipex — Unix Inter-Process Communication & Redirections',
    content: `🚰 **pipex (Rank 02 Project)**:
Recreate the behavior of the shell pipeline: \`< file1 cmd1 | cmd2 > file2\`.

**System Calls Used**:
\`\`\`c
int fd[2];
pipe(fd);           // fd[0] = read end, fd[1] = write end
pid = fork();       // Child process executes cmd1, writes to fd[1]
dup2(fd[1], STDOUT_FILENO);
execve(path, args, envp);
\`\`\`

**Checklist**:
• Parse the \`PATH\` variable from \`envp\` to find command executables.
• Close unused pipe file descriptors in both parent and child processes to avoid hanging.
• Handle \`heredoc\` (\`<<\`) and append mode (\`>>\`) for bonus points.

[? Explain Minishell ?] [? Philosophers threading ?] [? Norminette checklist ?]`
  },

  so_long: {
    title: 'so_long — 2D Tile Engine with MiniLibX',
    content: `🎮 **so_long (Rank 02 Project)**:
Build a top-down 2D game using MiniLibX (MLX42).

**Map Validation Rules (\`.ber\` file)**:
• Rectangular map composed of \`1\` (wall), \`0\` (empty), \`C\` (collectible), \`E\` (exit), \`P\` (start).
• Must be surrounded by walls (\`1\`).
• **Flood Fill Algorithm**: You MUST verify with Flood Fill that there is a valid path to all collectibles (\`C\`) and the exit (\`E\`).
• Clean exit on \`ESC\` key and window close button (X).

[? Flood Fill algorithm in C ?] [? Philosophers guide ?] [? Minishell guide ?]`
  },

  // --- RANK 3 ---
  philosophers: {
    title: 'Philosophers — Multithreading, Mutexes & Concurrency',
    content: `🍝 **Philosophers (Rank 03 Project)**:
Solve the classic Dining Philosophers Problem using POSIX threads and mutexes.

**Rules & Synchronization**:
• Each philosopher is a thread (\`pthread_create\`).
• Each fork is a mutex (\`pthread_mutex_t\`).
• A philosopher needs 2 forks to eat (\`time_to_eat\`), then sleeps (\`time_to_sleep\`), then thinks.
• Must avoid **Deadlocks** (e.g. odd/even philosopher staggered pick-up strategy).
• Must avoid **Data Races** (protect simulation status and timestamps with state mutexes).
• Precision timing: Use \`gettimeofday\` with a micro-sleep loop (\`usleep(500)\`) rather than a single giant \`usleep\`.

[? Deadlock prevention strategy ?] [? Minishell architecture ?] [? C++ Modules overview ?]`
  },

  minishell: {
    title: 'Minishell — Creating a Unix Shell',
    content: `🐚 **Minishell (Rank 03 Project)**:
Write a functional Unix command shell from scratch in C with peer-level complexity.

**Architecture Pipeline**:
1. **Lexer / Tokenizer**: Break command line into tokens (\`WORD\`, \`PIPE\`, \`REDIR_IN\`, \`REDIR_OUT\`, \`HEREDOC\`, \`APPEND\`).
2. **Parser & Expander**: Handle single \`'\` (literal) and double \`"\` (expand variables \`$VAR\` / \`$?\`), build AST or command table.
3. **Executor**: Create pipes, fork child processes, handle redirections with \`dup2\`, execute with \`execve\`.
4. **Signals**: Handle \`Ctrl+C\` (new line prompt), \`Ctrl+\\\` (do nothing in prompt), \`Ctrl+D\` (exit EOF).
5. **Builtins**: Implement \`echo\` (-n flag), \`cd\`, \`pwd\`, \`export\`, \`unset\`, \`env\`, \`exit\`.

[? How to handle heredoc in Minishell ?] [? C++ Modules guide ?] [? Cub3D raycasting ?]`
  },

  // --- RANK 4 & 5 ---
  cub3d: {
    title: 'cub3D — 3D Raycasting Engine (Wolfenstein 3D)',
    content: `🏰 **cub3D (Rank 04 Project)**:
Build a first-person 3D raycasting game engine inspired by Wolfenstein 3D using MiniLibX.

**Key Mathematics**:
• **DDA Algorithm (Digital Differential Analysis)**: Cast rays through grid squares to find wall collisions with minimal float computation.
• Texture projection: Map wall hit coordinates (\`wallX\`) to 2D image textures (North, South, East, West).
• Wall collision detection & smooth player movement (strafing & rotation matrix).

[? Explain C++ Modules ?] [? Double degree with HHN ?] [? Web Transcendence ?]`
  },

  cpp: {
    title: 'C++ Modules (CPP 00 to 09) — Modern C++ & OOP',
    content: `⚡ **C++ Modules (Rank 04 Project)**:
Transition from C to Object-Oriented Programming (C++98 standard).

**Core Topics Covered**:
• **CPP 00**: Namespaces, classes, member functions, \`std::cout\`, \`std::cin\`.
• **CPP 01**: Memory allocation (\`new\`/\`delete\`), references vs pointers, pointers to members.
• **CPP 02**: Fixed-point numbers, Operator overloading, **Orthodox Canonical Form** (Default constructor, Copy constructor, Assignment operator, Destructor).
• **CPP 03**: Inheritance and subclassing.
• **CPP 04**: Subtype polymorphism, abstract classes, pure virtual functions (\`= 0\`), interfaces.
• **CPP 05**: Exceptions (\`try\`, \`catch\`, custom \`std::exception\`).
• **CPP 06**: C++ Casts (\`static_cast\`, \`dynamic_cast\`, \`const_cast\`, \`reinterpret_cast\`).
• **CPP 07**: Templates (function & class templates).
• **CPP 08**: STL containers (\`vector\`, \`list\`, \`map\`), iterators, algorithms.
• **CPP 09**: Real-world STL: \`std::stack\` (RPN), \`std::map\` (Bitcoin), Merge-Insert sort (PmergeMe).

[? Orthodox Canonical Form example ?] [? ft_transcendence ?] [? HHN Double Degree ?]`
  },

  transcendence: {
    title: 'ft_transcendence — Full-Stack Web Application (Final Boss)',
    content: `🏆 **ft_transcendence (Rank 05 Project)**:
The capstone project of the 42 Common Core! Build a full-stack web application featuring multiplayer real-time Pong.

**Major Modules**:
• **Backend Framework**: NestJS, Django, or FastAPI with PostgreSQL database.
• **Frontend**: Single Page Application (SPA) with TypeScript/Vanilla JS/React.
• **Real-Time Multiplayer**: WebSockets for game state sync and live chat.
• **Security**: 2-Factor Authentication (2FA via TOTP/Google Authenticator), JWT authentication, OAuth2 (42 Intra login).
• **Deployment**: Fully containerized using Docker Compose.

[? Double Degree HHN graduation ?] [? Internship guidelines ?] [? Peer evaluation tips ?]`
  }
};

module.exports = {
  CURRICULUM_DATABASE,
  findCurriculumMatch(query) {
    const q = (query || '').toLowerCase();
    
    if (q.includes('libft')) return CURRICULUM_DATABASE.libft;
    if (q.includes('printf')) return CURRICULUM_DATABASE.ft_printf;
    if (q.includes('get_next_line') || q.includes('gnl')) return CURRICULUM_DATABASE.get_next_line;
    if (q.includes('born2beroot') || q.includes('b2br') || q.includes('monitoring.sh')) return CURRICULUM_DATABASE.born2beroot;
    if (q.includes('push_swap') || q.includes('push swap') || q.includes('turk')) return CURRICULUM_DATABASE.push_swap;
    if (q.includes('pipex')) return CURRICULUM_DATABASE.pipex;
    if (q.includes('so_long') || q.includes('so long')) return CURRICULUM_DATABASE.so_long;
    if (q.includes('philo') || q.includes('philosopher')) return CURRICULUM_DATABASE.philosophers;
    if (q.includes('minishell')) return CURRICULUM_DATABASE.minishell;
    if (q.includes('cub3d') || q.includes('cub 3d') || q.includes('raycast')) return CURRICULUM_DATABASE.cub3d;
    if (q.includes('cpp') || q.includes('c++') || q.includes('canonical form')) return CURRICULUM_DATABASE.cpp;
    if (q.includes('transcendence') || q.includes('pong')) return CURRICULUM_DATABASE.transcendence;
    
    return null;
  }
};
