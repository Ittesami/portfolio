// Built-in study courses. They are copied into the `studyCourses` collection the first
// time the Study tab loads (see lib/study.js); after that the database copy is yours to
// edit (add, rename or remove modules and items), and this file is only a starting point.
//
// Course: { _id (slug), title, short, accent, order, modules: [{ id, title, note?, items }] }
// Item:   { id, title, type, link?, difficulty?, detail?, quiz? }
//   type: lesson | problem (LeetCode etc.) | project | task | practice (in-app quiz) | exam (score)
//   quiz: { bank: "aws-clf", module: n } or { bank: "aws-clf", random: n }

const lc = (slug) => `https://leetcode.com/problems/${slug}/`;
const lesson = (id, title, extra = {}) => ({ id, title, type: "lesson", ...extra });
const task = (id, title, extra = {}) => ({ id, title, type: "task", ...extra });
const project = (id, title, detail = "", extra = {}) => ({ id, title, type: "project", detail, ...extra });
const problem = (id, title, slug, difficulty) => ({ id, title, type: "problem", link: lc(slug), difficulty });
const exam = (id, title, extra = {}) => ({ id, title, type: "exam", ...extra });

// ---------------------------------------------------------------- DSA
const DSA = {
  _id: "dsa",
  title: "Data Structures & Algorithms",
  short: "Learn each data structure, then solve at least two LeetCode problems with it.",
  accent: "blue",
  order: 1,
  modules: [
    {
      id: "basics",
      title: "Big-O and the basics",
      note: "Every later module uses this. Know why a hash map lookup is O(1) and a sorted search is O(log n).",
      items: [
        lesson("basics-bigo", "Big-O: time and space complexity"),
        lesson("basics-patterns", "How to approach a problem: brute force first, then optimise"),
        problem("basics-p1", "Fizz Buzz", "fizz-buzz", "Easy"),
        problem("basics-p2", "Running Sum of 1d Array", "running-sum-of-1d-array", "Easy"),
      ],
    },
    {
      id: "arrays",
      title: "Arrays and hashing",
      items: [
        lesson("arrays-l1", "Arrays: indexing, insertion and deletion costs"),
        lesson("arrays-l2", "Hash maps and hash sets: how hashing works"),
        problem("arrays-p1", "Two Sum", "two-sum", "Easy"),
        problem("arrays-p2", "Contains Duplicate", "contains-duplicate", "Easy"),
        problem("arrays-p3", "Valid Anagram", "valid-anagram", "Easy"),
        problem("arrays-p4", "Group Anagrams", "group-anagrams", "Medium"),
        problem("arrays-p5", "Top K Frequent Elements", "top-k-frequent-elements", "Medium"),
        problem("arrays-p6", "Product of Array Except Self", "product-of-array-except-self", "Medium"),
      ],
    },
    {
      id: "two-pointers",
      title: "Two pointers",
      items: [
        lesson("tp-l1", "Two pointers on a sorted array or a string"),
        problem("tp-p1", "Valid Palindrome", "valid-palindrome", "Easy"),
        problem("tp-p2", "Two Sum II - Input Array Is Sorted", "two-sum-ii-input-array-is-sorted", "Medium"),
        problem("tp-p3", "3Sum", "3sum", "Medium"),
        problem("tp-p4", "Container With Most Water", "container-with-most-water", "Medium"),
      ],
    },
    {
      id: "sliding-window",
      title: "Sliding window",
      items: [
        lesson("sw-l1", "Fixed and variable-size sliding windows"),
        problem("sw-p1", "Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "Easy"),
        problem("sw-p2", "Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "Medium"),
        problem("sw-p3", "Longest Repeating Character Replacement", "longest-repeating-character-replacement", "Medium"),
      ],
    },
    {
      id: "stack",
      title: "Stack",
      items: [
        lesson("stack-l1", "Stacks: push, pop, peek (LIFO)"),
        lesson("stack-l2", "Monotonic stacks"),
        problem("stack-p1", "Valid Parentheses", "valid-parentheses", "Easy"),
        problem("stack-p2", "Min Stack", "min-stack", "Medium"),
        problem("stack-p3", "Evaluate Reverse Polish Notation", "evaluate-reverse-polish-notation", "Medium"),
        problem("stack-p4", "Daily Temperatures", "daily-temperatures", "Medium"),
      ],
    },
    {
      id: "queue",
      title: "Queue and deque",
      items: [
        lesson("queue-l1", "Queues (FIFO) and double-ended queues"),
        problem("queue-p1", "Implement Queue using Stacks", "implement-queue-using-stacks", "Easy"),
        problem("queue-p2", "Number of Recent Calls", "number-of-recent-calls", "Easy"),
        problem("queue-p3", "Sliding Window Maximum", "sliding-window-maximum", "Hard"),
      ],
    },
    {
      id: "binary-search",
      title: "Binary search",
      items: [
        lesson("bs-l1", "Binary search and its off-by-one traps"),
        problem("bs-p1", "Binary Search", "binary-search", "Easy"),
        problem("bs-p2", "Search a 2D Matrix", "search-a-2d-matrix", "Medium"),
        problem("bs-p3", "Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", "Medium"),
        problem("bs-p4", "Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "Medium"),
      ],
    },
    {
      id: "linked-list",
      title: "Linked list",
      items: [
        lesson("ll-l1", "Singly and doubly linked lists; the dummy-head trick"),
        lesson("ll-l2", "Fast and slow pointers"),
        problem("ll-p1", "Reverse Linked List", "reverse-linked-list", "Easy"),
        problem("ll-p2", "Merge Two Sorted Lists", "merge-two-sorted-lists", "Easy"),
        problem("ll-p3", "Linked List Cycle", "linked-list-cycle", "Easy"),
        problem("ll-p4", "Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "Medium"),
        problem("ll-p5", "Reorder List", "reorder-list", "Medium"),
      ],
    },
    {
      id: "trees",
      title: "Binary trees",
      items: [
        lesson("tree-l1", "Tree terms and traversals: pre-, in-, post-order (DFS)"),
        lesson("tree-l2", "Level-order traversal with a queue (BFS)"),
        problem("tree-p1", "Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "Easy"),
        problem("tree-p2", "Invert Binary Tree", "invert-binary-tree", "Easy"),
        problem("tree-p3", "Same Tree", "same-tree", "Easy"),
        problem("tree-p4", "Diameter of Binary Tree", "diameter-of-binary-tree", "Easy"),
        problem("tree-p5", "Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "Medium"),
      ],
    },
    {
      id: "bst",
      title: "Binary search trees",
      items: [
        lesson("bst-l1", "BST rules: search, insert, delete"),
        problem("bst-p1", "Search in a Binary Search Tree", "search-in-a-binary-search-tree", "Easy"),
        problem("bst-p2", "Validate Binary Search Tree", "validate-binary-search-tree", "Medium"),
        problem("bst-p3", "Lowest Common Ancestor of a Binary Search Tree", "lowest-common-ancestor-of-a-binary-search-tree", "Medium"),
        problem("bst-p4", "Kth Smallest Element in a BST", "kth-smallest-element-in-a-bst", "Medium"),
      ],
    },
    {
      id: "heap",
      title: "Heap / priority queue",
      items: [
        lesson("heap-l1", "Min-heaps and max-heaps; heapq in Python"),
        problem("heap-p1", "Kth Largest Element in a Stream", "kth-largest-element-in-a-stream", "Easy"),
        problem("heap-p2", "Last Stone Weight", "last-stone-weight", "Easy"),
        problem("heap-p3", "K Closest Points to Origin", "k-closest-points-to-origin", "Medium"),
        problem("heap-p4", "Kth Largest Element in an Array", "kth-largest-element-in-an-array", "Medium"),
      ],
    },
    {
      id: "trie",
      title: "Trie",
      items: [
        lesson("trie-l1", "Tries (prefix trees) for word lookups"),
        problem("trie-p1", "Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", "Medium"),
        problem("trie-p2", "Design Add and Search Words Data Structure", "design-add-and-search-words-data-structure", "Medium"),
      ],
    },
    {
      id: "graphs",
      title: "Graphs",
      items: [
        lesson("graph-l1", "Graph representations: adjacency list and matrix"),
        lesson("graph-l2", "BFS and DFS on graphs and grids"),
        lesson("graph-l3", "Topological sort"),
        problem("graph-p1", "Find if Path Exists in Graph", "find-if-path-exists-in-graph", "Easy"),
        problem("graph-p2", "Number of Islands", "number-of-islands", "Medium"),
        problem("graph-p3", "Clone Graph", "clone-graph", "Medium"),
        problem("graph-p4", "Rotting Oranges", "rotting-oranges", "Medium"),
        problem("graph-p5", "Course Schedule", "course-schedule", "Medium"),
      ],
    },
    {
      id: "union-find",
      title: "Union-find (disjoint set)",
      items: [
        lesson("uf-l1", "Union-find with path compression and union by rank"),
        problem("uf-p1", "Number of Provinces", "number-of-provinces", "Medium"),
        problem("uf-p2", "Redundant Connection", "redundant-connection", "Medium"),
      ],
    },
    {
      id: "backtracking",
      title: "Recursion and backtracking",
      items: [
        lesson("bt-l1", "Recursion and the call stack"),
        lesson("bt-l2", "Backtracking: choose, explore, un-choose"),
        problem("bt-p1", "Subsets", "subsets", "Medium"),
        problem("bt-p2", "Permutations", "permutations", "Medium"),
        problem("bt-p3", "Combination Sum", "combination-sum", "Medium"),
      ],
    },
    {
      id: "dp",
      title: "Dynamic programming",
      items: [
        lesson("dp-l1", "Memoisation (top-down) vs tabulation (bottom-up)"),
        problem("dp-p1", "Climbing Stairs", "climbing-stairs", "Easy"),
        problem("dp-p2", "Min Cost Climbing Stairs", "min-cost-climbing-stairs", "Easy"),
        problem("dp-p3", "House Robber", "house-robber", "Medium"),
        problem("dp-p4", "Coin Change", "coin-change", "Medium"),
        problem("dp-p5", "Longest Increasing Subsequence", "longest-increasing-subsequence", "Medium"),
      ],
    },
    {
      id: "review",
      title: "Review",
      note: "Spaced repetition: a problem you solved once is easy to forget.",
      items: [
        task("review-1", "Re-solve 5 problems you found hardest, without looking at your old code"),
        task("review-2", "Timed set: 2 Mediums in 45 minutes"),
        task("review-3", "Explain 3 solutions out loud, as in an interview"),
      ],
    },
  ],
};

// ---------------------------------------------------------------- AWS
// Modules and topics follow the CLF-C02 study guide; practice questions are in
// lib/study/aws-clf-questions.js.
const AWS_MODULES = [
  [1, "Introduction to the Cloud", ["Key notes: the six advantages, deployment models, service models"], 6],
  [2, "Compute in the Cloud", ["Amazon EC2", "EC2 instance families", "EC2 pricing options", "Scaling and load balancing", "Messaging and decoupling"], 8],
  [3, "Exploring Compute Services", ["Serverless", "Containers", "Other compute options", "Picking the right compute"], 7],
  [4, "Going Global", ["AWS global infrastructure", "Provisioning and managing resources"], 7],
  [5, "Networking", ["Amazon VPC", "Getting traffic in and out", "Security groups vs network ACLs", "DNS and edge networking"], 8],
  [6, "Storage", ["Three types of storage", "EC2 instance store vs Amazon EBS", "Amazon S3", "S3 storage classes", "File storage", "Hybrid, backup and transfer"], 9],
  [7, "Databases", ["Relational (SQL) databases", "NoSQL databases", "In-memory caching", "Analytics database", "Moving databases", "Picking the right database"], 8],
  [8, "AI, ML and Data Analytics", ["The three layers of AWS AI/ML", "Data analytics services"], 10],
  [9, "Security", ["Shared responsibility model", "IAM", "Compliance resources", "Protecting against attacks", "Detection and assessment", "Encryption and secrets"], 12],
  [10, "Monitoring, Compliance and Governance", ["Monitoring and auditing", "Advice and health", "Governing many accounts", "Compliance in practice"], 9],
  [11, "Pricing and Support", ["How AWS pricing works", "AWS Free Tier", "Cost management tools", "AWS Support plans", "Other sources of help"], 9],
  [12, "Migrating to the AWS Cloud", ["AWS Cloud Adoption Framework (CAF)", "The 7 Rs of migration", "Migration tools"], 9],
  [13, "Well-Architected Solutions", ["The six pillars", "General cloud design principles", "Disaster recovery strategies"], 9],
];

const AWS = {
  _id: "aws-clf",
  title: "AWS Cloud Practitioner (CLF-C02)",
  short: "Learn the 13 modules, practise every question, then pass the exam (700/1000).",
  accent: "amber",
  order: 2,
  modules: [
    {
      id: "start",
      title: "Before you start",
      note: "65 questions in 90 minutes (120 with ESL +30). Domains: Cloud Concepts 24%, Security 30%, Technology 34%, Billing 12%.",
      items: [
        task("start-1", "Read the exam essentials and domain weights in the study guide"),
        task("start-2", "Request the ESL +30 accommodation in your AWS Certification account (before booking)"),
        task("start-3", "Open Cloud Practitioner Essentials on AWS Skill Builder", { link: "https://skillbuilder.aws/" }),
        task("start-4", "Book the exam about 2-3 weeks out (target: late November)", { link: "https://aws.amazon.com/certification/certified-cloud-practitioner/" }),
      ],
    },
    ...AWS_MODULES.map(([n, title, topics, count]) => ({
      id: `m${n}`,
      title: `Module ${n} · ${title}`,
      items: [
        ...topics.map((t, i) => lesson(`m${n}-l${i + 1}`, t)),
        { id: `m${n}-quiz`, title: `Practice questions (${count})`, type: "practice", quiz: { bank: "aws-clf", module: n } },
      ],
    })),
    {
      id: "hands-on",
      title: "Hands-on (week 2)",
      note: "Ten minutes of clicking makes services stick far better than reading. Use the free plan and delete what you create.",
      items: [
        task("ho-1", "Create an AWS account on the free plan"),
        task("ho-2", "Turn on MFA for the root user"),
        task("ho-3", "Create an IAM user (and stop using root)"),
        task("ho-4", "Launch a t3.micro EC2 instance, connect, then terminate it"),
        task("ho-5", "Create an S3 bucket and upload a file"),
        task("ho-6", "Set an AWS Budget alert"),
      ],
    },
    {
      id: "exams",
      title: "Practice exams (week 3)",
      note: "Book the real exam once you're scoring 80%+ consistently. Review every wrong answer and every lucky guess.",
      items: [
        { id: "ex-mixed", title: "Mixed practice: 30 random questions from all modules", type: "practice", quiz: { bank: "aws-clf", random: 30 } },
        exam("ex-official", "Official practice question set (Skill Builder)", { link: "https://skillbuilder.aws/" }),
        exam("ex-1", "Full practice test 1 (e.g. Tutorials Dojo or Stephane Maarek)"),
        exam("ex-2", "Full practice test 2"),
        exam("ex-3", "Full practice test 3"),
        task("ex-review", "Review every wrong answer and reread those notes"),
      ],
    },
    {
      id: "exam-day",
      title: "Exam day",
      items: [
        task("day-1", "Run the Pearson VUE system test on the same laptop and network (no hotspot)"),
        task("day-2", "Clear desk, ID ready, check in 30 minutes early"),
        exam("day-3", "Sit the exam (pass mark 700/1000)"),
      ],
    },
  ],
};

// ---------------------------------------------------------------- AI engineer
const DOCS = "https://platform.claude.com/docs";
const AI = {
  _id: "ai-engineer",
  title: "AI Engineer with Claude",
  short: "From your first API call to deployed agents, RAG and evals, with a project in every module.",
  accent: "violet",
  order: 3,
  modules: [
    {
      id: "foundations",
      title: "Foundations",
      note: "Your MSc covers the theory; this is the practical refresh.",
      items: [
        lesson("f-1", "How LLMs work: tokens, embeddings, attention, next-token prediction"),
        lesson("f-2", "Python for AI work: virtual envs, typing, async"),
        lesson("f-3", "HTTP, REST and JSON: calling and building APIs"),
        lesson("f-4", "Context windows, model sizes, cost and latency trade-offs"),
      ],
    },
    {
      id: "api",
      title: "The Claude API",
      items: [
        lesson("api-1", "Get an API key and keep it server-side", { link: DOCS }),
        lesson("api-2", "The Messages API: your first request (TypeScript or Python SDK)"),
        lesson("api-3", "System prompts and multi-turn conversations"),
        lesson("api-4", "Streaming responses"),
        lesson("api-5", "Choosing a model: Opus, Sonnet, Haiku"),
        lesson("api-6", "Adaptive thinking and effort levels"),
        lesson("api-7", "Errors, retries, rate limits and refusals (stop reasons)"),
        lesson("api-8", "Token counting and tracking cost"),
        project("api-p", "Project: a CLI chat assistant that streams and shows the cost of each reply"),
      ],
    },
    {
      id: "prompting",
      title: "Prompt engineering",
      items: [
        lesson("pe-1", "Anthropic's interactive prompt engineering tutorial", { link: "https://github.com/anthropics/courses" }),
        lesson("pe-2", "Clear, direct instructions and giving context"),
        lesson("pe-3", "Examples (multishot prompting)"),
        lesson("pe-4", "Structuring long prompts with XML tags"),
        lesson("pe-5", "Long documents: put them first, ask at the end"),
        lesson("pe-6", "Structured outputs: JSON that matches a schema"),
        project("pe-p", "Project: meal-log parser that turns your food log into kcal and protein JSON", "Compare it with the app's rule-based estimator."),
      ],
    },
    {
      id: "multimodal",
      title: "Images, PDFs and documents",
      items: [
        lesson("mm-1", "Vision: sending images"),
        lesson("mm-2", "PDF and document input"),
        lesson("mm-3", "Citations: answers that quote their source"),
        lesson("mm-4", "The Files API: upload once, reuse"),
        project("mm-p", "Project: ask questions about your AWS study guide, with citations"),
      ],
    },
    {
      id: "tools",
      title: "Tool use and agents",
      items: [
        lesson("tool-1", "Tool use: defining tools and the tool-use loop"),
        lesson("tool-2", "Strict tool use and parallel tool calls"),
        lesson("tool-3", "The SDK Tool Runner"),
        lesson("tool-4", "Server tools: web search, web fetch, code execution"),
        lesson("tool-5", "Workflows vs agents: when not to build an agent"),
        lesson("tool-6", "Managing context: compaction, context editing, memory"),
        project("tool-p1", "Project: research agent that searches the web and writes a cited brief"),
        project("tool-p2", "Project: assistant with tools for your portfolio data (to-dos, fitness, study)"),
      ],
    },
    {
      id: "mcp",
      title: "Model Context Protocol (MCP)",
      items: [
        lesson("mcp-1", "What MCP is: servers, tools, resources, prompts", { link: "https://modelcontextprotocol.io" }),
        lesson("mcp-2", "Build an MCP server with the TypeScript SDK"),
        lesson("mcp-3", "Use MCP servers from Claude Code and the API (MCP connector)"),
        project("mcp-p", "Project: an MCP server for your fitness and study data"),
      ],
    },
    {
      id: "rag",
      title: "RAG and embeddings",
      items: [
        lesson("rag-1", "Embeddings and vector search"),
        lesson("rag-2", "Chunking strategies"),
        lesson("rag-3", "Vector stores: MongoDB Atlas Vector Search, pgvector"),
        lesson("rag-4", "Hybrid search and reranking"),
        lesson("rag-5", "Contextual retrieval"),
        lesson("rag-6", "Measuring retrieval quality (recall@k)"),
        project("rag-p", "Project: RAG over your notes (DSA, AWS, MSc modules)"),
      ],
    },
    {
      id: "evals",
      title: "Evals, cost and speed",
      items: [
        lesson("ev-1", "Building an eval set from real examples"),
        lesson("ev-2", "Grading: code checks vs LLM-as-judge"),
        lesson("ev-3", "Improving a prompt against an eval, without overfitting"),
        lesson("ev-4", "Prompt caching"),
        lesson("ev-5", "Message Batches for bulk jobs"),
        project("ev-p", "Project: an eval suite for your meal-log parser"),
      ],
    },
    {
      id: "safety",
      title: "Safety and reliability",
      items: [
        lesson("sf-1", "Prompt injection and untrusted content"),
        lesson("sf-2", "Guardrails, refusal handling and fallbacks"),
        lesson("sf-3", "Secrets, privacy and data retention"),
        lesson("sf-4", "Observability: logging and tracing (OpenTelemetry)"),
      ],
    },
    {
      id: "production",
      title: "Agents in production",
      items: [
        lesson("pr-1", "Claude Agent SDK: Claude Code as a library", { link: "https://code.claude.com/docs/en/agent-sdk" }),
        lesson("pr-2", "Managed Agents: hosted agents and sessions"),
        lesson("pr-3", "Agent Skills"),
        lesson("pr-4", "Multi-agent patterns: orchestrator and workers"),
        lesson("pr-5", "Deploying AI features: streaming UI in Next.js on Vercel or AWS"),
        project("pr-p", "Project: an \"Ask my CV\" chatbot on your portfolio"),
      ],
    },
    {
      id: "ml",
      title: "ML foundations (alongside your MSc)",
      items: [
        lesson("ml-1", "A classic ML baseline with scikit-learn"),
        lesson("ml-2", "PyTorch basics: train a small model"),
        lesson("ml-3", "Open models and embeddings on Hugging Face"),
        lesson("ml-4", "Fine-tuning vs prompting vs RAG: choosing"),
      ],
    },
    {
      id: "capstone",
      title: "Capstone and career",
      items: [
        project("cap-1", "Capstone 1: an app with RAG, tools and evals, deployed"),
        project("cap-2", "Capstone 2: an agent that automates a real task for you"),
        task("cap-3", "Write a case study for each capstone on your portfolio"),
        task("cap-4", "Practise LLM system-design interview questions"),
      ],
    },
  ],
};

export const BUILT_IN_COURSES = [DSA, AWS, AI];
