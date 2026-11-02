// Default site content. Used as-is until MongoDB is connected; after that, a
// document in the `profile` collection with _id "main" overrides any of these keys.
// `npm run seed` writes this object to the database as a starting point.
//
// Empty strings / empty arrays are hidden on the page.
// Photos and the avatar come from public/photos automatically (see lib/photos.js),
// so you don't need to list them here.

export const profile = {
  name: "Ittehad Rahman",
  role: "AI engineer · Data analyst · Full stack developer",
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
      short: "Metabase and Power BI dashboards and SQL analysis for a CFD brokerage.",
      org: "NEXT Ventures (FNmarkets), Dhaka",
      tag: "Apr 2026 – Jul 2026",
      summary:
        "Built and maintained Metabase and Power BI dashboards tracking trader lifecycle KPIs for a CFD brokerage. Wrote SQL to extract, clean and reconcile large volumes of customer and trading data, and presented acquisition-to-retention funnel (AARRR) findings to non-technical stakeholders.",
    },
    {
      title: "Full Stack Developer",
      org: "Al Bayt Hospital Management System",
      short: "Building a private hospital management system, plus the hospital's website.",
      tag: "Sep 2025 – Present",
      summary:
        "Architecting a multi-tenant hospital management system in Next.js and MongoDB as a private project, with role-based access, offline and online sync, and pharmacy, pathology and billing modules. Built the pharmacy backend in Go. Also built the hospital's public website.",
    },
    {
      title: "Full Stack Developer",
      org: "Kernel Technologies, Dhaka",
      short: "Built and maintained business applications in a small, fast-moving team.",
      tag: "Jan 2025 – Aug 2025",
      summary: "Built and maintained business applications as part of a small, deadline-driven team.",
    },
    {
      title: "Project Manager",
      org: "Labaid Hospitals and Diagnostics, Dhaka",
      short: "Brought a stalled website translation and localisation project back on track.",
      tag: "Nov 2024 – Dec 2024",
      summary:
        "Brought in to restart a translation and localisation project for an existing web platform that had stalled over technical problems and budget concerns. Assessed the technical and financial issues, rescoped the work for better value, set up quality checks for translation accuracy, and acted as the link between the developers and senior management, turning technical problems into clear business decisions.",
    },
    {
      title: "Full Stack Developer Intern",
      org: "Singularity Limited, Dhaka",
      short: "MERN-stack systems for healthcare and manufacturing clients.",
      tag: "Jun 2024 – Sep 2024",
      summary:
        "Delivered MERN-stack web systems for healthcare and manufacturing clients, including billing and records modules. Gathered requirements directly from clients, wrote user documentation and trained staff on the new systems.",
    },
    {
      title: "Math and Science Tutor",
      org: "Noor Tutor",
      short: "Teaching maths and science online to students in the US.",
      tag: "Dec 2025 – Present",
      summary:
        "Teaching US-based students online, building strong fundamentals for further study and giving each student individual attention.",
    },
    {
      title: "Private Tutor",
      org: "Self-employed",
      short: "O and A Level Maths, Physics, Chemistry and CS, now through Study With Sami.",
      tag: "2020 – Present",
      summary:
        "Teaching O Level Maths, Physics, Chemistry and Computer Science, and A Level Maths, Physics and Further Maths. My classes now run through Study With Sami, the platform I built for them.",
    },
  ],
  projects: [
    {
      slug: "study-with-sami",
      name: "Study With Sami",
      short: "My tutoring platform for O & A Level Maths and Computer Science: bookings, payments, live classes and a parent portal.",
      kind: "Live platform",
      featured: true,
      summary:
        "My own tutoring platform for Cambridge O & A Level Mathematics and Computer Science. Students sign up, book a free class and pay; I verify payments and teach live small-group classes on Google Meet; parents get their own login to follow attendance, marks and progress.",
      stack: ["Next.js 16", "TypeScript", "MongoDB", "Tailwind CSS", "Argon2", "Resend", "Vercel"],
      link: "https://study-with-sami.vercel.app/",
      repo: "",
      caseStudy: {
        problem:
          "Teaching students across Bangladesh as a one-person business means handling sign-ups, per-class payments by bKash or bank transfer, class schedules, study materials and updates for parents, all at once.",
        approach:
          "Built a full-stack Next.js and TypeScript app on MongoDB. Student and parent accounts use Argon2id password hashing and database-backed sessions. Enrolment checks each payment by its transaction ID, and billing is per class, monthly. Courses come with chapter notes, topic Q&A, topic exams and mock papers, with maths rendered by KaTeX. Separate live, preview and development databases keep real student data safe while I build.",
        outcome:
          "Live, teaching O Level Computer Science (CIE 2210) and A Level Mathematics (CIE 9709), with a free first class for every new student.",
      },
    },
    {
      slug: "al-bayt-hms",
      name: "Al Bayt HMS",
      short: "A private hospital management system with offline sync, pharmacy, pathology and billing.",
      kind: "Private · In progress",
      summary:
        "A hospital management system I'm building for Al Bayt Hospital: multi-tenant, with offline and online sync, role-based access, and pharmacy, pathology and billing modules.",
      stack: ["Next.js", "MongoDB", "Go", "RBAC", "Offline sync"],
      link: "",
      repo: "",
      caseStudy: {
        problem:
          "A hospital needs reception, pharmacy, pathology and billing working from the same records, and it can't stop working when the internet drops.",
        approach:
          "Next.js and MongoDB with role-based access, so each department sees only what it needs. Changes made offline are kept locally and synced once the connection is back. The data model is multi-tenant, so one deployment can serve more than one facility, and the pharmacy runs on its own Go backend.",
        outcome: "In active development as a private project for Al Bayt Hospital, so the system and code aren't public.",
      },
    },
    {
      slug: "al-bayt-hospital-website",
      name: "Al Bayt Hospital website",
      short: "Bilingual hospital website with services, a doctors directory and a staff admin panel.",
      kind: "Live website",
      summary:
        "The public website for Al Bayt Hospital in Jatrabari, Dhaka, in Bengali and English: emergency, pathology and ultrasound services, a directory of specialist doctors and appointment requests, with an admin panel for staff to manage the doctors.",
      stack: ["Next.js", "MongoDB", "JWT auth", "Bengali / English"],
      link: "https://www.albaythospital.com/",
      repo: "",
    },
    {
      slug: "dr-farida-khan",
      name: "Dr. Farida Khan",
      short: "Practice website for a gynaecologist, with her services and online appointment booking.",
      kind: "Live website",
      summary:
        "Practice website for Dr. Farida Khan, gynaecologist and obstetrician: her credentials, 15 services, chamber hours at Al Bayt Hospital and online appointment booking, in English and Bengali.",
      stack: ["Appointment booking", "Bengali / English", "Responsive"],
      link: "https://drfaridakhan.com/",
      repo: "",
    },
    {
      slug: "llm-code-review",
      name: "LLMs for code review",
      short: "My thesis: benchmarking GPT-4, LLaMA and CodeLLaMA on automated code review.",
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
    places: ["Nepal", "Thailand", "Maldives", "Dubai", "Saudi Arabia", "United Kingdom"],
    tableTennis:
      "Captain of my school team, then captain at IUT during my bachelor's, and now a member of the club at Brunel. Always up for watching a big match too.",
  },
  // Travel map. ISO 3166-1 numeric country codes (see lib/world.js COUNTRIES).
  // Countries of your travel albums are added to the map automatically.
  travel: {
    home: "050", // Bangladesh
    visited: ["826", "524", "764", "462", "784", "682"], // UK, Nepal, Thailand, Maldives, UAE, Saudi Arabia
    intro: "From Dhaka to Bristol, with a few stops on the way. Each album is one trip: where I went, what it was like, and the photos.",
  },
};
