import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import NavBar from "../components/navbar";

// ==========================================
// 1. DATA: NOTES CONTENT BASED ON FE EXAM BOOKS
// ==========================================

const HIGHLIGHT_STYLE = "hover:bg-yellow-200 text-black font-semibold rounded-sm duration-300 cursor-pointer";

const Highlight = ({ children }: { children: React.ReactNode }) => {
    const term = React.Children.toArray(children)
        .map((child) => (typeof child === "string" ? child : ""))
        .join(" ")
        .trim();

    const query = encodeURIComponent(term || "computer science");

    return (
        <a
            href={`https://www.google.com/search?q=${query}`}
            target="_blank"
            rel="noreferrer noopener"
            className={HIGHLIGHT_STYLE}
            title={`Search Google for ${term || "this topic"}`}
        >
            {children}
        </a>
    );
};

const notesData = [
    {
        id: "cs-fundamentals",
        title: "1. Computer Science Fundamentals",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    At the core of computing is the <Highlight>Basic Theory of Information</Highlight>, which establishes that computers process all data using the <Highlight>Binary system (Base-2)</Highlight>, utilizing only the digits 0 and 1. To interface with human-readable formats, systems perform <Highlight>Radix Conversion</Highlight> between binary, <Highlight>Decimal (Base-10)</Highlight>, and <Highlight>Hexadecimal (Base-16)</Highlight>. Hexadecimal is exceptionally efficient because a single hex digit perfectly represents exactly 4 bits (a nibble).
                </p>
                <p>
                    Internal data is stored using specific <Highlight>Numerical Representations</Highlight>. Integers are generally processed as <Highlight>Fixed-point numbers</Highlight>, which use <Highlight>Two's Complement</Highlight> to represent negative values efficiently without requiring special hardware. Real numbers rely on <Highlight>Floating-point representation</Highlight> (typically standardizing on IEEE 754), separating numbers into a sign, exponent, and mantissa. Because memory has finite capacity, arithmetic operations can introduce inaccuracies, such as <Highlight>Rounding errors</Highlight>, <Highlight>Cancellation of significant digits</Highlight> (occurring when subtracting nearly equal numbers), and <Highlight>Loss of trailing digits</Highlight> (occurring when adding extremely large and small numbers together).
                </p>
                <p>
                    Beyond mathematics, computers utilize <Highlight>Non-Numerical Representations</Highlight>. Character sets map binary to human alphabets using standards like the traditional 7-bit <Highlight>ASCII</Highlight> or the comprehensive multi-byte <Highlight>Unicode</Highlight>. Multimedia data also requires standardization, utilizing formats like <Highlight>JPEG</Highlight> for compressing still images and <Highlight>MPEG</Highlight> for video compression.
                </p>
                <p>
                    For decision making and processing, systems utilize <Highlight>Boolean Algebra</Highlight> and <Highlight>Logical Operations</Highlight>. The fundamental building blocks are <Highlight>AND</Highlight> (logical product), <Highlight>OR</Highlight> (logical sum), <Highlight>NOT</Highlight> (logical negation), and <Highlight>XOR</Highlight> (exclusive OR). These expressions can be manipulated mathematically using rules like <Highlight>De Morgan's Theorem</Highlight>. In hardware, these logic gates are combined to build arithmetic circuits, such as the <Highlight>Half Adder</Highlight> (adds two bits but ignores incoming carries) and the <Highlight>Full Adder</Highlight> (which properly calculates carries from lower bits).
                </p>
                <p>
                    To define programming languages unambiguously, computer science relies on <Highlight>BNF (Backus-Naur Form)</Highlight>, a meta-syntax notation for context-free grammars. When programs compile or calculate expressions, they frequently convert traditional infix notation into <Highlight>Reverse Polish Notation (RPN)</Highlight> (postfix notation). In RPN, operators follow their operands (e.g., "3 4 +" instead of "3 + 4"). This completely eliminates the need for parentheses and allows computers to evaluate complex expressions mechanically using a <Highlight>Stack</Highlight> data structure, which operates on a strict <Highlight>LIFO (Last-In, First-Out)</Highlight> principle.
                </p>
            </div>
        )
    },
    {
        id: "data-structures",
        title: "2. Data Structures & Databases",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    Efficient software relies heavily on selecting the appropriate memory layout. <Highlight>Arrays</Highlight> store elements in contiguous memory locations, allowing extremely fast random access via indices. However, their fixed size makes insertions and deletions slow. Conversely, <Highlight>Linked Lists</Highlight> store data dynamically in scattered memory nodes, each containing a data field and a pointer to the next node. While this allows for rapid insertions and deletions without shifting elements, it requires sequential access. Variations include <Highlight>Doubly Linked Lists</Highlight> (pointers to both next and previous nodes) and <Highlight>Circular Linked Lists</Highlight>.
                </p>
                <p>
                    Two fundamental abstract data types are <Highlight>Stacks</Highlight> and <Highlight>Queues</Highlight>. A Stack operates on a strict <Highlight>LIFO (Last-In, First-Out)</Highlight> principle, adding (Push) and removing (Pop) data from a single end. This is heavily used in recursive function calls and evaluating RPN expressions. A Queue operates on a <Highlight>FIFO (First-In, First-Out)</Highlight> principle, processing data in the exact order it arrived—essential for OS task scheduling. To optimize memory reuse in queues, systems often implement a <Highlight>Circular Queue</Highlight>, logically connecting the back of the queue to the front.
                </p>
                <p>
                    For hierarchical data, <Highlight>Trees</Highlight> are indispensable. A <Highlight>Binary Tree</Highlight> restricts each parent node to a maximum of two children. A highly efficient variant is the <Highlight>Binary Search Tree (BST)</Highlight>, where the left child is always smaller than the parent, and the right child is always larger, enabling rapid data retrieval. Another critical structure is the <Highlight>Heap</Highlight>, a complete binary tree used to quickly find the maximum or minimum value in a dataset, forming the basis of priority queues.
                </p>
                <p>
                    In data persistence, the <Highlight>Relational Database Management System (RDBMS)</Highlight> organizes data into two-dimensional tables consisting of rows (tuples) and columns (attributes). Relationships between tables are strictly established using a <Highlight>Primary Key</Highlight> (a unique identifier for a row) and a <Highlight>Foreign Key</Highlight> (a reference to a Primary Key in another table). Data retrieval and manipulation are handled via <Highlight>SQL (Structured Query Language)</Highlight>.
                </p>
                <p>
                    To maintain rigorous data integrity, databases utilize <Highlight>Normalization</Highlight> (typically up to the Third Normal Form, or 3NF). This process logically divides tables to eliminate data redundancy and prevent operational anomalies during data insertion, updating, or deletion. Furthermore, to ensure reliability during concurrent operations, database transactions must strictly adhere to <Highlight>ACID Properties</Highlight> (Atomicity, Consistency, Isolation, Durability), utilizing concurrency controls like <Highlight>Exclusive Locks</Highlight> and <Highlight>Shared Locks</Highlight> to prevent data inconsistencies.
                </p>
            </div>
        )
    },
    {
        id: "communication-networks",
        title: "3. Communication Networks",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    Modern network architectures are conceptualized using the <Highlight>OSI (Open Systems Interconnection) Reference Model</Highlight>, separating communication into seven distinct layers: Physical (Layer 1), Data Link (Layer 2), Network (Layer 3), Transport (Layer 4), Session (Layer 5), Presentation (Layer 6), and Application (Layer 7). Interconnection devices operate at specific layers: <Highlight>Repeaters</Highlight> regenerate signals at L1, <Highlight>Bridges</Highlight> and <Highlight>L2 Switches</Highlight> forward frames using <Highlight>MAC Addresses</Highlight> at L2, <Highlight>Routers</Highlight> forward packets using IP addresses at L3, and <Highlight>Gateways</Highlight> translate protocols at L4 and above.
                </p>
                <p>
                    Local Area Networks (LANs) predominantly use the Ethernet standard. To manage data traffic on a shared medium, traditional Ethernet utilizes <Highlight>CSMA/CD (Carrier Sense Multiple Access with Collision Detection)</Highlight>. In this access control method, a node listens to the cable before transmitting; if a collision with another node's data is detected, both nodes wait a random amount of time before attempting to retransmit.
                </p>
                <p>
                    The internet relies primarily on the <Highlight>TCP/IP Protocol Suite</Highlight>. At the Transport layer, <Highlight>TCP (Transmission Control Protocol)</Highlight> ensures highly reliable, connection-oriented data delivery via mechanisms like a three-way handshake, error-checking, and sequence control. Conversely, <Highlight>UDP (User Datagram Protocol)</Highlight> provides a connectionless, low-overhead service that does not guarantee delivery, making it ideal for real-time voice and video streaming where speed is prioritized over perfect accuracy.
                </p>
                <p>
                    Routing data across global networks requires logical addressing. <Highlight>IPv4</Highlight> utilizes 32-bit addresses, which are managed using <Highlight>Subnet Masks</Highlight> to logically separate the network address from the host address. To mitigate IPv4 address exhaustion, networks use <Highlight>NAT (Network Address Translation)</Highlight> to convert private LAN IP addresses into public internet-facing IPs. Ultimately, the industry is transitioning to <Highlight>IPv6</Highlight>, which uses massive 128-bit addresses to provide virtually unlimited unique identifiers.
                </p>
                <p>
                    At the Application layer, numerous protocols facilitate daily internet services. <Highlight>DNS (Domain Name System)</Highlight> resolves human-readable domain names into IP addresses. <Highlight>DHCP (Dynamic Host Configuration Protocol)</Highlight> automatically assigns IP configurations to client devices upon connecting to a network. For email communication, <Highlight>SMTP (Simple Mail Transfer Protocol)</Highlight> is utilized for sending, while <Highlight>POP3</Highlight> or IMAP handles receiving. 
                </p>
            </div>
        )
    },
    {
        id: "computer-systems",
        title: "4. Computer Systems & Hardware",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    The foundation of all computing hardware is the <Highlight>CPU (Central Processing Unit)</Highlight>, which acts as the brain of the computer. It consists of the <Highlight>ALU (Arithmetic Logic Unit)</Highlight> for mathematical and logical calculations, <Highlight>Registers</Highlight> for temporary high-speed data storage, and the <Highlight>Control Unit</Highlight> for directing operations. CPU performance is typically evaluated using <Highlight>Clock Frequency</Highlight> or <Highlight>MIPS (Million Instructions Per Second)</Highlight>.
                </p>
                <p>
                    CPUs execute programs using a strict <Highlight>Instruction Cycle</Highlight>. This involves sequentially fetching the instruction from memory, decoding it, calculating the effective address of the operands, executing the operation, and writing the result back. To optimize throughput, modern systems use <Highlight>Pipelining</Highlight>, allowing multiple instructions to be processed simultaneously at different stages of the cycle.
                </p>
                <p>
                    Data storage relies on the <Highlight>Memory Hierarchy</Highlight>, balancing speed, capacity, and cost. At the top are CPU Registers, followed by highly expensive but fast <Highlight>Cache Memory</Highlight> (typically SRAM). Below that is the <Highlight>Main Memory</Highlight> (typically DRAM), and finally the slower, non-volatile <Highlight>Auxiliary Storage</Highlight> like HDDs and SSDs. The system uses the cache to bridge the massive speed gap between the blazing-fast CPU and the relatively slow main memory.
                </p>
                <p>
                    For auxiliary storage, data redundancy and read/write performance are critical for servers. Systems implement <Highlight>RAID (Redundant Array of Independent Disks)</Highlight> to achieve this. <Highlight>RAID 0 (Striping)</Highlight> splits data across multiple disks for raw speed but offers no redundancy. <Highlight>RAID 1 (Mirroring)</Highlight> duplicates data exactly for fault tolerance. <Highlight>RAID 5</Highlight> is the most common compromise, striping data along with parity bits across three or more disks to balance performance with data safety.
                </p>
                <p>
                    Evaluating system reliability often involves the <Highlight>RASIS</Highlight> framework (Reliability, Availability, Serviceability, Integrity, Security). The two most critical operational metrics are <Highlight>MTBF (Mean Time Between Failures)</Highlight>, representing the average time a system runs before breaking, and <Highlight>MTTR (Mean Time To Repair)</Highlight>, representing how long it takes to fix. The overall <Highlight>Availability</Highlight> (uptime percentage) of a system is mathematically calculated as: MTBF / (MTBF + MTTR).
                </p>
            </div>
        )
    },
    {
        id: "system-development",
        title: "5. System Development & Software Engineering",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    The creation of reliable software follows a structured <Highlight>Software Life Cycle</Highlight>. This generally consists of System Planning, Requirements Definition, System Design (Basic and Detailed), Programming (Implementation), Testing, and ultimately, Operations and Maintenance. Choosing the right <Highlight>Development Model</Highlight> is crucial: the <Highlight>Waterfall Model</Highlight> strictly completes one phase before moving to the next, making it highly structured but inflexible. In contrast, the <Highlight>Spiral Model</Highlight> and <Highlight>Agile</Highlight> methodologies rely on repeated iterative cycles, allowing for rapid adaptation to changing user requirements.
                </p>
                <p>
                    During the design phase, engineers use various modeling techniques to map out the system. A <Highlight>DFD (Data Flow Diagram)</Highlight> illustrates how data moves through processes, while an <Highlight>E-R Diagram (Entity-Relationship)</Highlight> models the logical structure of databases. Modern Object-Oriented design heavily relies on <Highlight>UML (Unified Modeling Language)</Highlight>, utilizing standardized visual tools like <Highlight>Use Case Diagrams</Highlight> for user interactions, <Highlight>Class Diagrams</Highlight> for system structure, and <Highlight>Sequence Diagrams</Highlight> for time-based message flow between objects.
                </p>
                <p>
                    Quality assurance requires rigorous <Highlight>Testing Phases</Highlight>. <Highlight>Unit Testing</Highlight> verifies individual modules using either <Highlight>White-box Testing</Highlight> (validating internal logic and code paths) or <Highlight>Black-box Testing</Highlight> (checking inputs/outputs against specifications without looking at the internal code). 
                </p>
                <p>
                    Next, <Highlight>Integration Testing</Highlight> connects these modules. This is often done via <Highlight>Top-down Integration</Highlight> (which uses dummy lower-level modules called <Highlight>Stubs</Highlight>) or <Highlight>Bottom-up Integration</Highlight> (which uses dummy upper-level control programs called <Highlight>Drivers</Highlight>). Finally, <Highlight>System Testing</Highlight> and <Highlight>Acceptance Testing</Highlight> ensure the complete software meets the original business requirements and operates smoothly in the actual environment.
                </p>
                <p>
                    Effective system development requires strict <Highlight>Project Management</Highlight>. Time and scheduling are frequently tracked using a <Highlight>Gantt Chart</Highlight>, which visualizes task durations on a calendar timeline. For complex dependencies, managers use an <Highlight>Arrow Diagram (PERT Chart)</Highlight> to calculate the <Highlight>Critical Path</Highlight>—the longest sequence of dependent tasks that dictates the absolute minimum time required to complete the entire project. Any delay on the critical path delays the whole project.
                </p>
            </div>
        )
    },
    {
        id: "security-standardization",
        title: "6. Security & Standardization",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    Information security fundamentally revolves around maintaining the <Highlight>CIA Triad</Highlight>: <Highlight>Confidentiality</Highlight> (only authorized users can access data), <Highlight>Integrity</Highlight> (data is accurate, complete, and untampered), and <Highlight>Availability</Highlight> (systems and data are consistently accessible when needed). To systematically manage these risks, organizations implement an <Highlight>ISMS (Information Security Management System)</Highlight>, which is internationally standardized under the <Highlight>ISO/IEC 27001</Highlight> framework.
                </p>
                <p>
                    Systems face a constant barrage of cyber threats. <Highlight>Malware</Highlight> is broadly categorized into Viruses (which attach to host files), Worms (which self-replicate across networks without human action), and Trojans (which disguise themselves as legitimate software). On the web, critical vulnerabilities include <Highlight>SQL Injection</Highlight> (manipulating backend databases via text input fields) and <Highlight>Cross-Site Scripting (XSS)</Highlight> (injecting malicious client-side scripts into web pages). Network availability is frequently targeted by <Highlight>DoS/DDoS (Distributed Denial of Service)</Highlight> attacks, which flood systems with illegitimate traffic.
                </p>
                <p>
                    To protect data confidentiality, systems utilize <Highlight>Cryptography</Highlight>. <Highlight>Common Key Cryptography</Highlight> (Symmetric encryption, like AES) uses the exact same key for both encryption and decryption; it is very fast but makes securely sharing the key difficult. <Highlight>Public Key Cryptography</Highlight> (Asymmetric encryption, like RSA) solves this by using a mathematically linked pair: a Public Key (freely distributed to anyone to encrypt data) and a strictly private Secret Key (used only by the receiver to decrypt).
                </p>
                <p>
                    To guarantee Data Integrity, systems use one-way <Highlight>Hash Functions</Highlight> (like SHA-256) to create a unique fixed-length digest of a file. Combining hashes with asymmetric encryption allows for <Highlight>Digital Signatures</Highlight>. A digital signature ensures <Highlight>Non-repudiation</Highlight> (the sender cannot deny sending the message). To trust that a public key actually belongs to a specific person or server, the internet relies on <Highlight>PKI (Public Key Infrastructure)</Highlight>, where a trusted third-party <Highlight>CA (Certificate Authority)</Highlight> issues verifiable Digital Certificates.
                </p>
                <p>
                    Defending the network perimeter requires robust hardware and software. A <Highlight>Firewall</Highlight> acts as the first line of defense, typically utilizing <Highlight>Packet Filtering</Highlight> to block or allow traffic strictly based on source/destination IP addresses and port numbers. For deeper, behavioral analysis, networks deploy an <Highlight>IDS (Intrusion Detection System)</Highlight> to passively alert administrators of malicious patterns, or an <Highlight>IPS (Intrusion Prevention System)</Highlight> to actively drop malicious packets in real-time.
                </p>
            </div>
        )
    },
    {
        id: "algorithms-programming",
        title: "7. Algorithms & Programming",
        content: (
            <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                    An <Highlight>Algorithm</Highlight> is a finite sequence of well-defined instructions used to solve a specific problem. Before writing actual code, logic is often modeled visually using <Highlight>Flowcharts</Highlight> or written textually as <Highlight>Pseudocode</Highlight>. To evaluate how efficient an algorithm is, computer scientists use <Highlight>Big O Notation</Highlight>, which describes the worst-case execution time or memory space required as the data size (n) grows. For example, O(1) represents constant time, O(n) is linear time, and O(n²) represents quadratic time.
                </p>
                <p>
                    Retrieving data efficiently is fundamental, relying heavily on <Highlight>Search Algorithms</Highlight>. A <Highlight>Linear Search</Highlight> sequentially checks every element (O(n)) and works on unsorted data. If the data is already sorted, a <Highlight>Binary Search</Highlight> is much faster (O(log n)), repeatedly dividing the search interval in half. For near-instantaneous retrieval, a <Highlight>Hash Search</Highlight> uses a hash function to compute the exact memory index (O(1)), though the system must handle <Highlight>Collisions</Highlight> when two different inputs produce the same hash.
                </p>
                <p>
                    Organizing data requires <Highlight>Sorting Algorithms</Highlight>. Basic sorts include <Highlight>Bubble Sort</Highlight> (repeatedly swapping adjacent elements if they are in the wrong order), <Highlight>Selection Sort</Highlight> (finding the minimum element and moving it to the front), and <Highlight>Insertion Sort</Highlight> (building a sorted array one element at a time). These basic algorithms generally have an inefficient time complexity of O(n²), making them unsuitable for large datasets.
                </p>
                <p>
                    For larger datasets, systems rely on Advanced Sorting Algorithms. <Highlight>Quick Sort</Highlight> selects a "pivot" element and partitions the array into smaller and larger elements, averaging a highly efficient O(n log n) time. <Highlight>Merge Sort</Highlight> continuously halves the array until single elements remain, then merges them back together in order. <Highlight>Heap Sort</Highlight> converts the array into a complete binary tree structure to repeatedly extract the maximum or minimum value.
                </p>
                <p>
                    In physical programming, a deep understanding of memory is required. When passing arguments to a function, <Highlight>Call by Value</Highlight> passes a copy of the data (protecting the original), whereas <Highlight>Call by Reference</Highlight> passes the memory address via a <Highlight>Pointer</Highlight>, allowing the function to modify the original variable. Furthermore, complex problems are often solved using <Highlight>Recursion</Highlight>—a method where a function calls itself. Every recursive function must have a strict <Highlight>Base Case</Highlight> to stop the execution, otherwise it will result in a fatal <Highlight>Stack Overflow</Highlight>.
                </p>
            </div>
        )
    }
];


// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function NotesPage() {
    const topicsScrollRef = React.useRef<HTMLDivElement>(null);

    const scrollTopicsLeft = () => {
        topicsScrollRef.current?.scrollBy({ left: -500, behavior: "smooth" });
    };

    const scrollTopicsRight = () => {
        topicsScrollRef.current?.scrollBy({ left: 500, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen flex w-full flex-col items-center bg-white gap-5 select-none font-sans">
            <NavBar />

            {/* TITLE AND CATEGORY CHANGE */}
            <div className="w-full min-h-[20vh] px-10 flex items-center justify-between border-b border-gray-100 pb-5">
                <h1 className="text-8xl text-black font-bold tracking-tighter opacity-80 transition-all duration-300 hover:opacity-100">
                    TECHNOLOGY
                </h1>

                <div className="flex gap-10">
                    <CategorySwitch label="MANAGEMENT" prompt="SWITCH TO MANAGEMENT?" />
                    <CategorySwitch label="STRATEGY" prompt="SWITCH TO STRATEGY?" />
                </div>
            </div>

            {/* TOPIC NAVIGATION (TABLE OF CONTENTS) */}
            <div className="w-full px-10 sticky top-0 bg-white/90 backdrop-blur-sm z-20 py-4 border-b border-gray-200 shadow-sm">
                <div
                    ref={topicsScrollRef}
                    className="mx-12 flex items-center gap-4 text-sm font-medium text-gray-500 tracking-widest overflow-x-auto pb-2"
                >
                    <span className="text-black pr-4 border-r border-gray-300 ">JUMP TO:</span>
                    {notesData.map((note) => (
                        <a 
                            key={note.id} 
                            href={`#${note.id}`} 
                            className="whitespace-nowrap hover:text-black transition-colors duration-200 uppercase"
                        >
                            {note.title}
                        </a>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={scrollTopicsLeft}
                    aria-label="Scroll topics left"
                    className="absolute left-10 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black transition-colors hover:bg-black hover:text-white"
                >
                    <CaretLeft size={16} weight="bold" />
                </button>

                <button
                    type="button"
                    onClick={scrollTopicsRight}
                    aria-label="Scroll topics right"
                    className="absolute right-10 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black transition-colors hover:bg-black hover:text-white"
                >
                    <CaretRight size={16} weight="bold" />
                </button>
            </div>

            {/* NOTES CONTENT AREA */}
            <div className="flex w-[95vw] justify-between ">
                <div className="w-full max-w-5xl px-10 py-12 flex flex-col gap-24">
                    {notesData.map((note) => (
                        <section key={note.id} id={note.id} className="scroll-mt-32">
                            <h2 className="text-4xl font-bold text-black mb-8 pb-4 border-b-2 border-black inline-block">
                                {note.title}
                            </h2>
                            {note.content}
                        </section>
                    ))}
                </div>

                <div className="">
                    <h1>ADD SOMETHING HERE</h1>
                </div>
            </div>
            
            {/* FOOTER PADDING */}
            <div className="h-32 w-full"></div>
        </div>
    );
}

// ==========================================
// 3. SUBCOMPONENTS
// ==========================================

type CategorySwitchProps = {
    label: string
    prompt: string
}

function CategorySwitch({ label, prompt }: CategorySwitchProps) {
    return (
        <button
            type="button"
            className="group relative isolate h-16 min-w-50 cursor-pointer overflow-hidden bg-white px-6 border border-gray-200 transition-all hover:border-black"
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 z-0 w-0 bg-black transition-[width] duration-300 group-hover:w-full"
            />

            <span className="relative z-10 flex h-full items-center justify-center">
                <h1 className="text-black font-light text-2xl transition-opacity duration-150 group-hover:opacity-0">
                    {label}
                </h1>
                <h1 className="pointer-events-none absolute text-white text-sm font-medium tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {prompt}
                </h1>
            </span>
        </button>
    );
}