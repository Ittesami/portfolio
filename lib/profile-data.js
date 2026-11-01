// Default site content. Used as-is until MongoDB is connected; after that, a
// document in the `profile` collection with _id "main" overrides any of these keys.
// `npm run seed` writes this object to the database as a starting point.
//
// Empty strings / empty arrays are hidden on the page.
// Photos and the avatar come from public/photos automatically (see lib/photos.js),
// so you don't need to list them here.

export const profile = {
  name: "Ittehad Rahman",
  role: "Data analyst · Full stack developer",
  email: "mohammadittehad@gmail.com",
  location: "Bristol, UK",
  hometown: "Dhaka, Bangladesh",
  lead: "Software engineer and business intelligence analyst. I build SQL-driven dashboards in Metabase and Power BI, and ship full-stack systems in React, Next.js, Node.js and Go for healthcare and manufacturing clients.",
  links: {
    cv: "/cv/Ittehad-Rahman-CV.pdf",
    profiles: [
      { label: "GitHub", href: "https://github.com/Ittesami", icon: "code" },
      { label: "GitHub", note: "Educational", href: "https://github.com/ittehadrahman", icon: "code" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ittehad-rahman-2a18741a6/", icon: "briefcase" },
      { label: "LeetCode", note: "Just started", href: "https://leetcode.com/u/9WRDOExYsP/", icon: "target" },
    ],
  },
  studying: {
    degree: "MSc Artificial Intelligence",
    school: "Brunel University London",
    until: "May 2027",
  },
  experience: [
    {
      title: "Business Intelligence Analyst",
      org: "NEXT Ventures (FNmarkets), Dhaka",
      tag: "Apr 2026 – Jul 2026",
      summary:
        "Built and maintained Metabase and Power BI dashboards tracking trader lifecycle KPIs for a CFD brokerage. Wrote SQL to extract, clean and reconcile large volumes of customer and trading data, and presented acquisition-to-retention funnel (AARRR) findings to non-technical stakeholders.",
    },
    {
      title: "Full Stack Developer",
      org: "Al Bayt Hospital Management System",
      tag: "Sep 2025 – Feb 2026",
      summary:
        "Architected a multi-tenant hospital management system in Next.js and MongoDB, with role-based access, offline and online sync, and pharmacy, pathology and billing modules. Built the pharmacy backend in Go.",
    },
    {
      title: "Full Stack Developer",
      org: "Kernel Technologies, Dhaka",
      tag: "Jan 2025 – Aug 2025",
      summary: "Built and maintained business applications as part of a small, deadline-driven team.",
    },
    {
      title: "Full Stack Developer Intern",
      org: "Singularity Limited, Dhaka",
      tag: "Jun 2024 – Sep 2024",
      summary:
        "Delivered MERN-stack web systems for healthcare and manufacturing clients, including billing and records modules. Gathered requirements directly from clients, wrote user documentation and trained staff on the new systems.",
    },
    {
      title: "Math and Science Tutor",
      org: "Noor Tutor",
      tag: "Dec 2025 – Present",
      summary:
        "Teaching US-based students online, building strong fundamentals for further study and giving each student individual attention.",
    },
    {
      title: "Private Tutor",
      org: "Self-employed",
      tag: "2020 – Present",
      summary:
        "Teaching O Level Maths, Physics, Chemistry and Computer Science, and A Level Maths, Physics and Further Maths.",
    },
  ],
  projects: [
    {
      slug: "al-bayt-hms",
      name: "Al Bayt HMS",
      kind: "Production",
      featured: true,
      summary:
        "Multi-tenant hospital management with offline and online sync, role-based access, pharmacy, pathology and billing modules.",
      stack: ["Next.js", "MongoDB", "Go", "RBAC", "Offline sync"],
      link: "",
      repo: "",
      caseStudy: {
        problem:
          "A hospital needs reception, pharmacy, pathology and billing working from the same records, and it can't stop working when the internet drops.",
        approach:
          "Architected it in Next.js and MongoDB with role-based access, so each department sees only what it needs. Changes made offline are kept locally and synced once the connection is back. The data model is multi-tenant, so one deployment can serve more than one facility, and the pharmacy runs on its own Go backend.",
        outcome: "Delivered the full system for Al Bayt Hospital, with pharmacy, pathology and billing modules.",
      },
    },
    {
      slug: "llm-code-review",
      name: "LLMs for code review",
      kind: "Thesis · A+",
      summary: "Undergraduate thesis at IUT benchmarking GPT-4, LLaMA and CodeLLaMA on automated code review.",
      stack: ["GPT-4", "LLaMA", "CodeLLaMA", "Evaluation"],
      link: "",
      repo: "",
      caseStudy: {
        problem: "Code review is slow and inconsistent. Can large language models take on part of it, and which ones do it best?",
        approach: "Benchmarked GPT-4, LLaMA and CodeLLaMA on automated code review tasks and compared the quality of their reviews.",
        outcome: "Graded A+ at the Islamic University of Technology.",
      },
    },
    {
      slug: "pharmacy-backend",
      name: "Pharmacy backend",
      kind: "Backend",
      summary: "The Go service behind the Al Bayt pharmacy module.",
      stack: ["Go", "REST APIs"],
      link: "",
      repo: "",
    },
  ],
  education: [
    {
      degree: "MSc Artificial Intelligence",
      meta: "Brunel University London · 2026 to present",
      note: "Awarded the Vice-Chancellor's Postgraduate International Excellence Award.",
      // Compulsory modules from brunel.ac.uk/study/courses/artificial-intelligence-msc
      modules: [
        "Artificial Intelligence",
        "Machine Learning",
        "Deep Learning",
        "Modern Data",
        "Quantitative Data Analysis",
        "Data Visualisation",
        "Ethics and Governance of Digital Systems",
        "Research Project Management",
      ],
    },
    {
      degree: "BSc Software Engineering",
      meta: "Islamic University of Technology, Bangladesh · CGPA 3.75 / 4.00",
      note: "Thesis (A+): benchmarked GPT-4, LLaMA and CodeLLaMA for automated code review.",
      modules: [
        "Web Development",
        "Database Management Systems",
        "Server Programming",
        "Data Structures and Algorithms",
        "Object-Oriented Programming",
        "Software Quality Assurance",
        "Cloud Development",
      ],
    },
  ],
  skills: [
    "SQL", "Power BI", "Metabase", "Excel", "KPI and funnel analysis", "Python", "JavaScript",
    "TypeScript", "Go", "React", "Next.js", "Node.js", "Express", "REST APIs", "PostgreSQL",
    "MongoDB", "Git", "LLM APIs",
  ],
  interests: {
    photography:
      "I shoot whatever catches the light: streets, coastlines, people. It trains the same eye for detail I use in code.",
    travel: "From Dhaka to Bristol, with a few stops on the way.",
    places: ["Nepal", "Thailand", "Maldives", "Dubai", "Saudi Arabia"],
    tableTennis:
      "Captain of my school team, then captain at IUT during my bachelor's, and now a member of the club at Brunel. Always up for watching a big match too.",
  },
};
