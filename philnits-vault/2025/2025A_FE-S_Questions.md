Created: 2025-04-14
Category: #mixed
Status: #philnits

---

# 2025A_FE-S_1

For an 8-bit binary integer, which of the following is the operation that extracts the most significant 4-bits while making the other bits zero?

a) Bitwise AND operation with 11110000.
b) Bitwise NAND operation with 11110000.
c) Bitwise OR operation with 00001111.
d) Bitwise XOR operation with 00001111.
?
**Answer: A**
### Step 1: Understand the goal

We want to keep the upper 4 bits unchanged and force the lower 4 bits to zero.

### Step 2: Apply bitwise AND logic

The AND operation outputs 1 only when **both** bits are 1. Using the mask `11110000`:

- Upper 4 bits: `x AND 1 = x` → original bits are preserved
- Lower 4 bits: `x AND 0 = 0` → forced to zero

Example: `10110110 AND 11110000 = 10110000` ✓

The other options fail: NAND inverts the result, OR with `00001111` sets lower bits to 1 rather than clearing them, and XOR flips bits rather than masking them.

---

# 2025A_FE-S_2

Which of the following is the binary fraction that is the nearest equivalent to the decimal fraction 23.375?

a) 10111.011
b) 10111.110
c) 11101.011
d) 11101.110
?
**Answer: A**
### Step 1: Convert the integer part

$23 \div 2$: repeated division gives $23 = 16+4+2+1 = 10111_2$

### Step 2: Convert the fractional part

$0.375 \times 2 = 0.75$ → bit **0**
$0.75 \times 2 = 1.5$ → bit **1**
$0.5 \times 2 = 1.0$ → bit **1**

So $0.375_{10} = .011_2$

### Step 3: Combine

$23.375_{10} = 10111.011_2$

---

# 2025A_FE-S_3

Which of the following is the most appropriate description of machine learning in AI?

a) It is a technology that enters specialized knowledge in a particular field into a computer, and has the computer infer by using the knowledge entered.
b) It is a technology that gives computers the ability to learn in the same way humans naturally learn, such as finding specific patterns from memorized data.
c) It is a technology that reproduces vital phenomena or evolutionary processes by using computers and machines.
d) It is a technology to give computers the ability to manage learning materials and learning by using a web system or other information technology so that people can learn interactively.
?
**Answer: B**
### Step 1: Identify each option's description

- Option A describes an **expert system** (rule-based inference from encoded knowledge).
- Option B describes **machine learning** — the computer finds patterns from data on its own.
- Option C describes **evolutionary computation / simulation** (e.g., genetic algorithms).
- Option D describes an **e-learning system**.

### Step 2: Match to machine learning

Machine learning is specifically about algorithms that improve through experience by identifying patterns in data, without being explicitly programmed with rules. Option B is the correct match.

---

# 2025A_FE-S_7

A hash table of size 11 uses open addressing with hash function $h(k) = k \text{ mod } 11$, and linear probing. The table shown below is created after inserting 4 values into an initially empty hash table. Which of the following is the sequence that represents a possible order in which the key values were inserted into the table?

[Table: index 2→79, index 3→14, index 4→35, index 5→92]

a) 14, 79, 35, 92
b) 79, 14, 92, 35
c) 79, 92, 35, 14
d) 92, 79, 14, 35
?
**Answer: B**
### Step 1: Compute home slots

- $79 \mod 11 = 2$ → home slot 2
- $14 \mod 11 = 3$ → home slot 3
- $35 \mod 11 = 2$ → home slot 2 (collision!)
- $92 \mod 11 = 4$ → home slot 4 (collision if 2, 3, 4 occupied!)

### Step 2: Trace option B — 79, 14, 92, 35

1. Insert **79**: slot 2 empty → placed at 2 ✓
2. Insert **14**: slot 3 empty → placed at 3 ✓
3. Insert **92**: slot 4 empty → placed at 4 ✓
4. Insert **35**: slot 2 taken (79), probe slot 3 taken (14), probe slot 4 taken (92), probe slot 5 empty → placed at 5 ✓

This matches the table perfectly.

---

# 2025A_FE-S_8

For a CPU with a clock frequency of 800 MHz, where one instruction is executed in an average time of 4 clock cycles, what is the CPU performance in MIPS?

a) 0.2
b) 20
c) 200
d) 3,200
?
**Answer: C**
### Step 1: Recall the MIPS formula

$$\text{MIPS} = \frac{\text{Clock frequency (Hz)}}{\text{CPI} \times 10^6}$$

### Step 2: Substitute values

$$\text{MIPS} = \frac{800 \times 10^6}{4 \times 10^6} = \frac{800}{4} = 200$$

---

# 2025A_FE-S_9

When a CPU has a special register used in push and pop instructions, which of the following is an appropriate term for this register?

a) Instruction register
b) Program counter
c) Stack pointer
d) Status register
?
**Answer: C**
### Step 1: Review CPU register functions

- **Instruction register**: holds the currently executing instruction.
- **Program counter**: holds the address of the next instruction to fetch.
- **Stack pointer**: holds the address of the top of the stack — used directly by PUSH and POP.
- **Status register**: stores flags like carry, zero, overflow.

### Step 2: Match to push/pop

PUSH and POP operate on the stack. The **stack pointer** is automatically incremented or decremented with each PUSH/POP operation, making C the correct answer.

---

# 2025A_FE-S_10

The table below shows the access times for the cache memory and main memory in systems A and B. Which of the following is the approximate hit ratio of the cache memory, when the effective access time and the cache memory hit ratio are the same for systems A and B?

[System A — Cache: 14 ns, Main: 80 ns]
[System B — Cache: 12 ns, Main: 90 ns]

a) 0.17
b) 0.20
c) 0.83
d) 1.00
?
**Answer: C**
### Step 1: Set up the effective access time equation

Let $h$ = hit ratio. Effective access time:

$$T = h \times T_{cache} + (1-h) \times T_{main}$$

### Step 2: Set System A = System B

$$14h + 80(1-h) = 12h + 90(1-h)$$

$$14h + 80 - 80h = 12h + 90 - 90h$$

$$-66h + 80 = -78h + 90$$

$$12h = 10$$

$$h = \frac{10}{12} \approx 0.83$$

---

# 2025A_FE-S_11

Which of the following is a merit of migrating an internal business system to a cloud service?

a) If an internal business system that requires a very high level of availability is to be migrated to IaaS, all service providers guarantee high availability, so the migration is easy.
b) If an internal on-premises business system with company-specific functions is to be migrated to a system provided by SaaS, the migration of the company-specific functions also becomes easier.
c) If PaaS is to be used, platform management and OS updates are performed by the service provider, so the burden of installation and operation can be reduced.
d) If SaaS is to be used temporarily for the development or evaluation of an internal business system, a highly flexible development environment can be provided.
?
**Answer: C**
### Step 1: Evaluate each option

- **A** is false — IaaS providers do not universally guarantee high availability; the customer is still responsible for their own architecture.
- **B** is false — SaaS provides standardized software, making it *harder*, not easier, to migrate unique company-specific functions.
- **C** is correct — With PaaS, the provider manages the underlying platform, OS, and middleware, reducing the operational burden on the customer.
- **D** is misleading — SaaS provides fixed applications, not flexible development environments; PaaS or IaaS would be more appropriate for development.

---

# 2025A_FE-S_12

In a system composed of two processing devices, what is the difference in availability between the two conditions below? The availability of each device is 0.9.

(1) System available if **at least one** device is running normally.
(2) System available only if **both** devices are running normally.

a) 0.09
b) 0.10
c) 0.18
d) 0.19
?
**Answer: C**
### Step 1: Calculate availability for condition (1) — parallel (at least one)

$$A_1 = 1 - (1-0.9)^2 = 1 - 0.01 = 0.99$$

### Step 2: Calculate availability for condition (2) — series (both required)

$$A_2 = 0.9 \times 0.9 = 0.81$$

### Step 3: Find the difference

$$A_1 - A_2 = 0.99 - 0.81 = 0.18$$

---

# 2025A_FE-S_14

In a system with preemptive priority scheduling (smallest number = highest priority), four processes have the following properties:

| Process | Arrival | Burst | Priority |
|---------|---------|-------|----------|
| P1 | 0 ms | 8 ms | 2 |
| P2 | 2 ms | 1 ms | 1 |
| P3 | 4 ms | 2 ms | 3 |
| P4 | 6 ms | 3 ms | 4 |

What is the average waiting time (in ms)?

a) 2.75
b) 3
c) 3.25
d) 3.5
?
**Answer: C**
### Step 1: Simulate the schedule

- t=0: P1 starts (priority 2)
- t=2: P2 arrives (priority 1) → **preempts P1**
- t=3: P2 finishes → P1 resumes (priority 2, highest remaining)
- t=4: P3 arrives (priority 3) → P1 continues (P1 has higher priority)
- t=6: P4 arrives (priority 4) → P1 continues
- t=9: P1 finishes (ran 2 ms before preemption + 6 ms after = 8 ms total) ✓
- t=9: P3 runs (priority 3)
- t=11: P3 finishes
- t=11: P4 runs
- t=14: P4 finishes

### Step 2: Calculate waiting times

- **P1**: ran 0–2, preempted; resumed 3–9. Waiting = 3 - 2 = **1 ms**
- **P2**: arrived t=2, ran immediately. Waiting = **0 ms**
- **P3**: arrived t=4, ran t=9. Waiting = 9 - 4 = **5 ms**
- **P4**: arrived t=6, ran t=11. Waiting = 11 - 6 = **5 ms**

### Step 3: Average

$$\text{Average} = \frac{1 + 0 + 5 + 5}{4} = \frac{11}{4} = 2.75 \text{ ms}$$

Wait — that gives 2.75. Let me re-check P1's waiting time.

P1 ran from 0–2 (2 ms), was preempted at t=2. It resumed at t=3 and ran until t=9 (6 ms). Total run = 8 ms ✓. P1's total time in system = 9 - 0 = 9. Burst = 8. Waiting = **1 ms**.

$$\text{Average} = \frac{1+0+5+5}{4} = 2.75$$

**Answer: A (2.75)**

---

# 2025A_FE-S_15

When it takes 10 ns to copy a byte, which of the following is the approximate time (in ms) to copy the data for a $1024 \times 768$-pixel graphics screen with 24-bit color?

a) 22
b) 23
c) 24
d) 25
?
**Answer: B**
### Step 1: Calculate total bytes

- Pixels: $1024 \times 768 = 786{,}432$
- Bytes per pixel: $24 \text{ bits} \div 8 = 3$ bytes
- Total bytes: $786{,}432 \times 3 = 2{,}359{,}296$ bytes

### Step 2: Calculate time

$$\text{Time} = 2{,}359{,}296 \times 10 \text{ ns} = 23{,}592{,}960 \text{ ns}$$

$$= 23.59 \text{ ms} \approx 23 \text{ ms}$$

---

# 2025A_FE-S_16

Which of the following is an appropriate explanation of an actuator?

a) It amplifies weak electrical signals sent from microphones, sensors, and similar devices.
b) It compares a given target value with a controlled value obtained from a sensor, and outputs an operation amount to match the controlled value with the target value.
c) It converts power from an energy source into rotation, translational motion, or other movements based on control signals.
d) It detects position, angle, velocity, acceleration, force, temperature, and similar parameters, and converts them into electrical information.
?
**Answer: C**
### Step 1: Define each component

- **A** describes an **amplifier**.
- **B** describes a **controller** (e.g., PID controller).
- **C** describes an **actuator** — a device that converts electrical control signals into physical motion or action.
- **D** describes a **sensor**.

### Step 2: Confirm

An actuator is the output device in a control system. Motors, solenoids, and hydraulic pistons are all examples. Option C is correct.

---

# 2025A_FE-S_17

When ordering data is entered, which of the following is the appropriate method for checking whether the order date is a business day that is the same as or prior to the entering date?

a) Duplication check
b) Format check
c) Logical check
d) Sequence check
?
**Answer: C**
### Step 1: Review input validation types

- **Duplication check**: detects duplicate records.
- **Format check**: verifies that data matches a required format (e.g., date as YYYY-MM-DD).
- **Logical check**: verifies that data makes sense in context — e.g., that a date falls within a valid range or is a business day relative to another date.
- **Sequence check**: verifies records are in the correct order.

### Step 2: Match to the requirement

Verifying that the order date is a business day and is on or before the entering date is a **logical check** — it requires comparing the value against contextual business rules.

---

# 2025A_FE-S_18

Of the functions provided by a DBMS, which of the following is a means for achieving protection for data confidentiality?

a) Checking referential constraints when the data is updated
b) Managing a transaction that combines a series of processes as a logical unit
c) Managing the data access rights of users
d) Placing an exclusive lock to data before updates
?
**Answer: C**
### Step 1: Map each option to its purpose

- **A** → **Integrity** (referential integrity enforcement)
- **B** → **Atomicity / consistency** (transaction management)
- **C** → **Confidentiality** (access control — only authorized users can view/modify data)
- **D** → **Concurrency control** (prevents simultaneous conflicting updates)

### Step 2: Identify confidentiality

Confidentiality means protecting data from unauthorized access. Managing access rights (permissions/roles) is the direct mechanism for this.

---

# 2025A_FE-S_19

Which of the following is the primary goal of conceptual database design?

a) To create a physical data model of the database
b) To define the logical structure of the database
c) To determine the exact data types for every database attribute
d) To implement database security measures
?
**Answer: B**
### Step 1: Understand database design phases

- **Conceptual design**: high-level, implementation-independent model of the data and relationships (e.g., ER diagram). Focuses on defining what data exists and how entities relate.
- **Logical design**: maps the conceptual model to a specific data model (e.g., relational tables).
- **Physical design**: determines storage structures, indexes, data types.

### Step 2: Match options

Option B — defining the logical structure — best represents the outcome of conceptual design, which is to define the structure of the data in an abstract, logical way. Options A, C, and D belong to physical design or implementation phases.

---

# 2025A_FE-S_21

Which of the following is the clause that should be inserted into blank A of the SQL statement below in order to display the total sales data for each product that sold for at least $5,000?

```sql
SELECT ProductID, SUM(UnitPrice * Quantity)
FROM OrderDetails
[A]
```

a) `GROUP BY ProductID HAVING SUM(UnitPrice * Quantity) >= 5000;`
b) `HAVING SUM(UnitPrice * Quantity) >= 5000;`
c) `HAVING SUM(UnitPrice * Quantity) >= 5000 GROUP BY ProductID;`
d) `WHERE SUM(UnitPrice * Quantity) >= 5000;`
?
**Answer: A**
### Step 1: Understand GROUP BY and HAVING

- `GROUP BY` groups rows with the same ProductID together.
- `HAVING` filters the groups **after** aggregation (unlike `WHERE`, which filters rows before grouping).
- `HAVING` must come **after** `GROUP BY` in SQL syntax.

### Step 2: Eliminate wrong options

- **B**: Missing `GROUP BY` — the query would not group by product.
- **C**: `HAVING` before `GROUP BY` violates SQL syntax.
- **D**: `WHERE` cannot filter on aggregate functions like `SUM()`.
- **A**: Correct — groups by ProductID first, then filters groups with total ≥ 5000.

---

# 2025A_FE-S_22

Which of the following is an appropriate explanation of the granularity of locks?

a) When large granularity is set for a large number of transactions to update the same data, the number of transactions that can be executed simultaneously increases.
b) When large granularity is set for all data in a table to be referenced, data referenced from other transactions can remain undisturbed.
c) When large granularity is set for data to be updated, the waiting times for other transactions increase, and the total throughput declines.
d) When large granularity is set, the number of data items included increases, and the number of locks that one transaction makes increases.
?
**Answer: C**
### Step 1: Understand lock granularity

Lock granularity refers to the size of the data unit being locked (e.g., table > page > row). **Large granularity** = locking a larger unit (e.g., the whole table).

### Step 2: Evaluate each option

- **A** is false — large granularity **decreases** concurrency because more data is blocked per lock.
- **B** is partially misleading — a table lock would *block* other transactions, not leave them undisturbed.
- **C** is correct — large granularity locks more data at once, so other transactions must wait longer, reducing throughput.
- **D** is false — large granularity means **fewer** locks are needed (one big lock instead of many small ones).

---

# 2025A_FE-S_23

Which of the following is the most appropriate information for a router to determine the destination of an incoming packet?

a) Destination IP address
b) Destination MAC address
c) Source IP address
d) Source MAC address
?
**Answer: A**
### Step 1: Recall router operation

Routers operate at **Layer 3 (Network layer)** and make forwarding decisions based on **IP addresses**. They consult their routing table using the **destination IP address** to determine the next hop.

### Step 2: Eliminate other options

- **MAC addresses** are used by switches at Layer 2 (within a single network segment).
- **Source addresses** are not used for forwarding decisions (they may be used for filtering/logging).

---

# 2025A_FE-S_24

In the OSI model, which of the following is the layer responsible for routing datagrams between hosts utilizing IP addresses across one or more networks?

a) Data link
b) Network
c) Physical
d) Transport
?
**Answer: B**
### Step 1: Review OSI layer functions

| Layer | Function |
|-------|----------|
| Physical | Bit transmission over a medium |
| Data link | Frame delivery within a single network (uses MAC) |
| **Network** | **Packet routing across networks using IP addresses** |
| Transport | End-to-end communication (TCP/UDP) |

IP operates at the **Network layer (Layer 3)**, which is responsible for logical addressing and routing.

---

# 2025A_FE-S_25

Which of the following is an appropriate explanation regarding Address Resolution Protocol (ARP)?

a) It converts MAC addresses into IP addresses.
b) It resolves domain names into its IP addresses.
c) It resolves IP addresses into the corresponding MAC addresses.
d) It translates IPv4 addresses into IPv6 addresses.
?
**Answer: C**
### Step 1: Define ARP

ARP (Address Resolution Protocol) is used within a local network to find the **MAC address** that corresponds to a known **IP address**. A host broadcasts "Who has IP X?" and the device with that IP replies with its MAC address.

### Step 2: Eliminate others

- **A** describes Reverse ARP (RARP).
- **B** describes DNS.
- **D** describes NAT64 or similar translation mechanisms.

---

# 2025A_FE-S_26

The administrator tests reachability of a remote host using [A] and determines the path that packets take to the destination with [B].

a) [A] netstat, [B] ping
b) [A] netstat, [B] traceroute
c) [A] ping, [B] traceroute
d) [A] traceroute, [B] ping
?
**Answer: C**
### Step 1: Define the tools

- **ping**: sends ICMP echo requests to test **reachability** of a host.
- **traceroute** (or `tracert` on Windows): reveals the **path (hops)** packets take to reach the destination.
- **netstat**: displays network connections, routing tables, and interface statistics — not used for reachability testing.

### Step 2: Match to the blanks

- [A] = testing reachability → **ping**
- [B] = determining path → **traceroute**

---

# 2025A_FE-S_27

Which of the following is the attack that is classified as DNS cache poisoning?

a) False domain information is injected into the DNS server that is referenced by a PC, and it leads the user to a fake server.
b) In order to interrupt the target service, the attacker uses the DNS server as a steppingstone to send a large number of recursive queries.
c) In order to obtain internal information, the zone information stored in the DNS server is compiled and transferred.
d) The version information of the DNS server software is obtained to identify a security hole.
?
**Answer: A**
### Step 1: Define DNS cache poisoning

DNS cache poisoning (also called DNS spoofing) is an attack where **corrupted DNS records are inserted into a resolver's cache**, causing users to be directed to malicious IP addresses when they look up legitimate domain names.

### Step 2: Match options

- **A** matches exactly — false domain info is injected into the DNS cache, redirecting users to a fake server.
- **B** describes a **DNS amplification/DDoS attack**.
- **C** describes **DNS zone transfer exploitation**.
- **D** describes **reconnaissance / version disclosure**.

---

# 2025A_FE-S_28

A given application only retrieves and displays user information from a database. Which of the following is the appropriate database access right assigned to the account the application uses?

a) Administrator right
b) Reference right
c) Update right
d) Update right and reference right
?
**Answer: B**
### Step 1: Apply the principle of least privilege

The application only performs **SELECT** (read) operations — it retrieves and displays data, nothing more. It does not insert, update, delete, create, or drop anything.

### Step 2: Match to rights

- **Reference right** (SELECT only) is sufficient and appropriate.
- Granting Update or Administrator rights would violate the principle of least privilege and introduce unnecessary security risk.

---

# 2025A_FE-S_29

Which of the following is a merit in using SaaS?

a) No system access management needs to be performed, and no consideration concerning password initialization or policy is required.
b) No system construction needs to be performed, and neither the definition of security requirements for application development nor the design of storage volume for system logs is required.
c) No system operation needs to be performed, and no consideration concerning work procedures at the time of a failure or backup is required.
d) No system security management needs to be performed, and neither the creation of information security management rules nor the assignment of an administrator is required.
?
**Answer: B**
### Step 1: Understand what SaaS offloads

With SaaS, the provider handles application development, infrastructure, and maintenance. The customer does **not** need to build or deploy the system — they simply use it.

### Step 2: Evaluate each option

- **A** is false — customers are still responsible for managing their own user accounts and access policies.
- **B** is correct — SaaS eliminates the need to construct the system; the provider handles application security requirements and infrastructure design.
- **C** is false — customers still need business continuity plans and must understand SLAs regarding backups and failures.
- **D** is false — customers still need to define internal security governance and assign administrators for their SaaS usage.

---

# 2025A_FE-S_30

Which of the following is an appropriate operation for user authentication that uses an IC card and a PIN?

a) Given that each user can be identified by an IC card, a common PIN is set for all users in order to reduce the management workload.
b) If an IC card is lost, a new IC card is issued, and after the PIN is reset, the lost IC card is deactivated.
c) The PIN is set by combining the numeric information imprinted on the surface of the IC card.
d) When an IC card is delivered, the PIN is not enclosed, but is notified to the user through another channel.
?
**Answer: D**
### Step 1: Evaluate security of each option

- **A** is insecure — a shared PIN defeats the purpose of individual authentication; anyone with any card could authenticate as anyone else.
- **B** is partially correct in procedure but problematic in order — the lost card should be **deactivated first**, before issuing a new one. The order as stated leaves a window of vulnerability.
- **C** is insecure — deriving a PIN from visible card information makes it easily guessable.
- **D** is a security best practice — separating the PIN delivery from the card delivery (two-channel delivery) ensures that even if the card is intercepted, the PIN remains unknown.

---

# 2025A_FE-S_31

Which of the following is the most effective method of detecting unauthorized changes of the contents of a web server?

a) Communications to the web server are monitored to ensure that there is no communication other than HTTP and HTTPS.
b) The hash value of each file of the contents of the web server is stored and periodically compared with the hash value generated from each file.
c) The memory usage of the web server is checked periodically to ensure that a buffer overflow has not occurred.
d) The updated date of each file of the contents of the web server is stored and compared periodically with the updated date of each file.
?
**Answer: B**
### Step 1: Compare detection methods

- **A** monitors protocols, not file content — it won't detect tampering.
- **B** uses cryptographic hash comparison. If a file is modified, its hash changes — this is a reliable, tamper-evident method.
- **C** monitors memory usage — unrelated to file content integrity.
- **D** compares file modification timestamps — these can be forged by an attacker; unreliable.

### Step 2: Confirm best answer

Hash-based integrity checking (e.g., using SHA-256) is the most robust and commonly recommended method for detecting file tampering.

---

# 2025A_FE-S_32

Which of the following is the function of a WAF?

a) Encrypting data and controlling access on web server
b) Inspecting and filtering HTTP requests
c) Managing user authentication and authorization
d) Scanning malware on a web server
?
**Answer: B**
### Step 1: Define WAF

A **Web Application Firewall (WAF)** operates at the application layer (Layer 7) and analyzes **HTTP/HTTPS traffic** to detect and block malicious requests such as SQL injection, cross-site scripting (XSS), and other web attacks.

### Step 2: Match to options

Option B — inspecting and filtering HTTP requests — directly describes what a WAF does. The other options describe encryption tools, identity management systems, and antivirus software respectively.

---

# 2025A_FE-S_33

Which of the following is an appropriate description concerning SPF for email communication?

a) It is a policy of the public relations department to designate a specific person to send emails.
b) It is an email sent from a spoofed email address without authorization.
c) It matches the sender mail server IP address with the information from the domain server and accepts or rejects email.
d) It sends an email to the address of a specific person instead of sending them to multiple email addresses.
?
**Answer: C**
### Step 1: Define SPF

**Sender Policy Framework (SPF)** is an email authentication protocol. The domain owner publishes a DNS record listing **authorized mail server IP addresses**. When an email is received, the receiving server checks whether the sending server's IP is listed in the sender domain's SPF record — if not, the email can be rejected or flagged as spam.

### Step 2: Match to option C

Option C correctly describes SPF: matching the sender mail server IP with domain DNS records to accept or reject email.

---

# 2025A_FE-S_34

Which of the following is the software architecture that decomposes applications into small, loosely coupled services that communicate over APIs?

a) Event-Driven Architecture
b) Microservices Architecture
c) Serverless Architecture
d) Service-Oriented Architecture (SOA)
?
**Answer: B**
### Step 1: Define each architecture

- **Event-Driven**: components communicate by producing and consuming events.
- **Microservices**: application is broken into small, independently deployable services that communicate via APIs (often REST or messaging).
- **Serverless**: code runs in stateless functions managed by a cloud provider; no server management.
- **SOA**: similar to microservices but typically uses heavier protocols (e.g., SOAP/ESB) and coarser-grained services.

### Step 2: Match to description

"Small, loosely coupled services communicating over APIs" is the defining characteristic of **Microservices Architecture**.

---

# 2025A_FE-S_36

Which of the following is an explanation of a software testing tool corresponding to a **static analysis tool** that supports static testing?

a) Data concerning the operating characteristics during program execution, such as module calling frequency, execution time, or execution frequency of executable statements is measured.
b) The instruction coverage rate and the branch coverage rate are automatically measured and analyzed on the basis of the test execution results.
c) The source code is analyzed to find out if grammatical errors or logical errors exist in a program.
d) The test data of the specified conditions and the program input files are generated automatically.
?
**Answer: C**
### Step 1: Define static vs. dynamic analysis

- **Static analysis**: examines source code **without executing it** — looks for syntax errors, code smells, potential bugs.
- **Dynamic analysis**: runs the program and measures behavior at runtime.

### Step 2: Match options

- **A** — runtime measurement → dynamic
- **B** — coverage measurement during execution → dynamic
- **C** — source code analysis for errors without running → **static** ✓
- **D** — test data generation → a separate category (test design tool)

---

# 2025A_FE-S_38

Which of the following is an appropriate test to ensure that the interfaces and linkages between different parts of software work properly?

a) Functional test
b) Integration test
c) Performance test
d) Unit test
?
**Answer: B**
### Step 1: Define each test type

- **Unit test**: tests individual functions or modules in isolation.
- **Integration test**: tests how multiple modules or components **work together** — specifically focuses on interfaces and interactions between parts.
- **Functional test**: verifies that the system performs its intended functions according to requirements.
- **Performance test**: measures speed, throughput, and stability under load.

### Step 2: Match to description

Testing "interfaces and linkages between different parts" is the definition of **integration testing**.

---

# 2025A_FE-S_39

Which of the following is the term that represents the process of generating a UML class diagram from a program?

a) Backtracking
b) Forward engineering
c) Re-engineering
d) Reverse engineering
?
**Answer: D**
### Step 1: Define the terms

- **Forward engineering**: going from a design/model to code (the normal direction).
- **Reverse engineering**: going from existing code **back to** a design or model (e.g., generating a class diagram from source code).
- **Re-engineering**: restructuring or rewriting a system, often involving reverse engineering as a step.
- **Backtracking**: an algorithm technique — unrelated here.

### Step 2: Match

Generating a UML class diagram **from a program** goes from implementation back to design → **Reverse engineering**.

---

# 2025A_FE-S_40

Which of the following is an appropriate explanation of a Sprint in the Scrum methodology?

a) A daily meeting where team members review progress and plan the day's work
b) A fixed-length period dedicated to developing a product increment
c) A self-organizing team responsible for product development
d) List of tasks and features the Scrum team has yet to complete
?
**Answer: B**
### Step 1: Review Scrum terminology

- **Daily Scrum**: the short daily stand-up meeting (option A).
- **Sprint**: a **time-boxed iteration** (typically 1–4 weeks) during which the team builds a potentially shippable product increment.
- **Development Team**: the self-organizing team (option C).
- **Product Backlog**: the ordered list of work to be done (option D).

### Step 2: Match

A **Sprint** is specifically the fixed-length development period — option B.

---

# 2025A_FE-S_41

Which of the following is an appropriate explanation of **earned value** in project management?

a) A measure of work completed in terms of budget authorized for that work
b) A time-phased budget that estimates the total cost of a project
c) An authorized budget for the planned work
d) Realized cost incurred for the work performed on an activity during a specific time period
?
**Answer: A**
### Step 1: Review Earned Value Management (EVM) terms

| Term | Definition |
|------|------------|
| **Earned Value (EV)** | The budgeted cost of work **actually performed** |
| **Planned Value (PV)** | The authorized budget for the planned work (option C) |
| **Actual Cost (AC)** | The realized cost incurred for work performed (option D) |
| **Budget at Completion (BAC)** | Total time-phased budget (option B) |

### Step 2: Match

**Earned Value** = budgeted amount for the work that has actually been completed = option A.

---

# 2025A_FE-S_42

Which of the following is the method of estimation in the COCOMO model in software estimation?

a) The effort and duration of the project are estimated based on the size of the software.
b) The effort of the project is estimated based on the duration of the project.
c) The size of the software and duration of the project are estimated based on the effort of the project.
d) The size of the software and effort of the project are estimated based on the duration of the project.
?
**Answer: A**
### Step 1: Define COCOMO

The **Constructive Cost Model (COCOMO)** estimates software project effort (person-months) and duration based on the **size of the software**, typically measured in thousands of lines of code (KLOC) or function points.

$$\text{Effort} = a \times (\text{Size})^b$$

### Step 2: Match to options

Option A correctly states that **effort and duration are derived from software size** — the foundational premise of COCOMO.

---

# 2025A_FE-S_43

An IT service is provided under the conditions below. What is the maximum downtime in hours that satisfies the SLA during a service period of one month?

- Business days in one month: 30
- Service hours: 8:00 AM to 10:00 PM (14 hours/day)
- Availability requirement: 99.5% or more

a) 0.3
b) 2.1
c) 3.0
d) 3.6
?
**Answer: B**
### Step 1: Calculate total service hours per month

$$30 \text{ days} \times 14 \text{ hours/day} = 420 \text{ hours}$$

### Step 2: Calculate maximum allowable downtime

$$\text{Max downtime} = 420 \times (1 - 0.995) = 420 \times 0.005 = 2.1 \text{ hours}$$

---

# 2025A_FE-S_44

Which of the following should be accomplished in service management concerning Maximum Tolerable Downtime (MTD), Recovery Point Objective (RPO), and Recovery Time Objective (RTO)?

a) MTD < RPO
b) MTD < RTO
c) RPO <= MTD
d) RTO <= MTD
?
**Answer: D**
### Step 1: Define the terms

- **MTD (Maximum Tolerable Downtime)**: the longest time a business can survive without a service.
- **RTO (Recovery Time Objective)**: the target time to restore the service after a disruption.
- **RPO (Recovery Point Objective)**: the maximum acceptable amount of data loss measured in time.

### Step 2: Establish the relationship

The system must be recovered **within** the MTD — otherwise the business suffers unacceptable consequences. Therefore:

$$RTO \leq MTD$$

If RTO exceeded MTD, the recovery target would be longer than the business can tolerate — which is unacceptable.

---

# 2025A_FE-S_45

Which of the following is a checkpoint for auditing the control of risks related to information leakage and unauthorized use of documents concerning a system?

a) Creating the necessary documents even in prototype development
b) Standardizing documents
c) Taking measures to ensure the confidentiality of documents
d) Updating documents without delay as changes are made in the system
?
**Answer: C**
### Step 1: Focus on the audit goal

The question asks specifically about **information leakage and unauthorized use** — these are **confidentiality** concerns.

### Step 2: Evaluate options

- **A** relates to completeness of documentation.
- **B** relates to consistency and quality.
- **C** directly addresses **confidentiality** — measures like access controls, encryption, and classification labels on documents.
- **D** relates to accuracy and currency.

---

# 2025A_FE-S_46

Which of the following is a technique used to perform optimal resource allocation for a computerization investment in each category classified on the basis of similarities in risks and investment value?

a) 3C analysis
b) Benchmarking
c) Enterprise architecture
d) IT portfolio
?
**Answer: D**
### Step 1: Define each technique

- **3C analysis**: analyzes Company, Customer, and Competitor — a strategic marketing framework.
- **Benchmarking**: comparing performance against industry standards.
- **Enterprise architecture**: holistic design of an organization's IT and business processes.
- **IT portfolio**: categorizes IT investments into groups (similar to a financial portfolio) to optimize resource allocation based on risk and value.

### Step 2: Match

Managing IT investments by classifying them and allocating resources optimally is the definition of **IT portfolio management**.

---

# 2025A_FE-S_47

Which of the following is a usage scenario for the adoption of UML as a technique for visualizing business processes?

a) Diagrams are shown by using a data-oriented approach where objects are handled as entities, their attributes, and the relationships among the entities.
b) To represent processes by using data flows, sources and sinks of data, data stores, and data processes are connected with arrows that indicate data flow.
c) To represent processes from multiple viewpoints, some purpose-specific modeling methods are used, and each model is depicted by using standardized notation rules for object modeling.
d) To thoroughly represent the functions of a process, the events that occur in response to a single request are described by using the conditional branch format.
?
**Answer: C**
### Step 1: Identify each description's methodology

- **A** describes **ER diagrams** (entity-relationship modeling).
- **B** describes **DFDs** (data flow diagrams).
- **C** describes **UML** — a family of standardized notations for modeling software and business processes from multiple viewpoints (use case, class, sequence, activity diagrams, etc.).
- **D** describes **decision trees** or event-driven process chains (EPC).

---

# 2025A_FE-S_48

Which of the following is an explanation of a hybrid cloud?

a) To configure and provide the service content of a cloud service for both consumers and companies
b) To customize some of the functions that are provided by a cloud service for the company's own use
c) To provide an environment where data and application software are linked and interoperable between a cloud service for the exclusive use of a company and a general-purpose cloud service
d) To separately provide the service content of a cloud service as paid services and free services
?
**Answer: C**
### Step 1: Define hybrid cloud

A **hybrid cloud** combines a **private cloud** (dedicated to one organization) with a **public cloud** (general-purpose), with integration and interoperability between them. Organizations can keep sensitive workloads private while leveraging the scalability of the public cloud.

### Step 2: Match

Option C describes exactly this — linking a company-exclusive cloud with a general-purpose cloud service with interoperability.

---

# 2025A_FE-S_49

Which of the following is an explanation of green procurement?

a) It refers not only to the fulfillment of the requirements of quality and price but to the preferential purchase of products and services with a lower environmental burden from companies that work toward a reduction in their environmental impact.
b) It refers to a certificate that enables commercial trading of the green power that is generated from natural energy sources such as solar, biomass, wind power, and geothermal heat.
c) It refers to international standards concerning environmental labels that are certified by a third party on the basis of certain criteria.
d) It refers to mass promotion of the details of environmental protection activities and raising funds for environmental protection from investors.
?
**Answer: A**
### Step 1: Define green procurement

**Green procurement** (or environmentally preferable purchasing) is the practice of buying products and services that have a reduced environmental impact compared to alternatives — considering the full supply chain, not just price and quality.

### Step 2: Match

Option A correctly captures this — preferentially purchasing from environmentally responsible companies and products with lower environmental burden.

- **B** describes **green power certificates / renewable energy certificates**.
- **C** describes **eco-label standards** (e.g., ISO 14024).
- **D** describes **green investment marketing / ESG promotion**.

---

# 2025A_FE-S_50

Which of the following is a characteristic of the **growth stage** in a product life cycle?

a) Demand decreases, and the withdrawal of some companies is observed. A decision needs to be made regarding whether it is possible to gain a strong foothold at this stage. Migration into an alternative market is also considered.
b) Demand is occasional, and exploiting new demand is key to success. Conviction for succeeding in a specific target market is necessary.
c) Demand reaches a peak, and the differentiation of the product and segmentation of the market become clear. The competition between competitors also intensifies, and it becomes important to add new product types and reduce costs.
d) The market starts to understand the value of the product. Both the product line and distribution channels need to be expanded. This stage sees an increase in sales and also requires investment.
?
**Answer: D**
### Step 1: Review product life cycle stages

| Stage | Characteristics |
|-------|----------------|
| Introduction | Low sales, low awareness, high investment |
| **Growth** | **Sales rising, market awareness growing, expanding distribution** |
| Maturity | Sales peak, heavy competition, differentiation |
| Decline | Sales falling, companies exit |

### Step 2: Match options

- **A** → Decline stage
- **B** → Introduction stage
- **C** → Maturity stage
- **D** → **Growth stage** ✓ — the market is starting to understand the product's value; sales are increasing; investment in expansion is needed.

---

# 2025A_FE-S_51

Which of the following is a description of cost-plus pricing?

a) It determines a competitive price by referring to the industry average and the pricing of competitors.
b) It determines a price by adding a certain margin to the manufacturing cost and the purchasing cost.
c) It determines a price that ensures a certain profit margin after all costs are covered on the basis of a target volume of sales.
d) It determines an appealing price by researching the quality and price that customers accept.
?
**Answer: B**
### Step 1: Define cost-plus pricing

**Cost-plus pricing** is a straightforward method: calculate the total cost of producing a product, then add a fixed markup (profit margin) to arrive at the selling price.

$$\text{Price} = \text{Cost} + \text{Markup}$$

### Step 2: Match to options

- **A** describes **competitive pricing**.
- **B** correctly describes **cost-plus pricing** — adding a margin to cost.
- **C** describes **target-return pricing**.
- **D** describes **value-based pricing**.

---

# 2025A_FE-S_52

Which of the following is an explanation of Supply Chain Management (SCM)?

a) Customer information collected through various channels is consolidated and utilized to establish closer relationships with customers.
b) Employees' skills and behavior characteristics are grasped, and management such as appropriate personnel assignment and evaluation from the perspective of human resources strategy is performed.
c) Intellectual assets of individuals, such as know-how and experience, are shared across the organization to be used for creative work.
d) The entire series of business operations, from purchasing and production to sales and distribution, is reexamined both within the company and among companies in view of total optimization in order to shorten delivery times and minimize inventory.
?
**Answer: D**
### Step 1: Define SCM

**Supply Chain Management (SCM)** involves coordinating and optimizing the flow of goods, information, and finances across the entire supply chain — from raw material suppliers through manufacturing, distribution, and delivery to the end customer.

### Step 2: Match to options

- **A** describes **CRM (Customer Relationship Management)**.
- **B** describes **HRM (Human Resource Management)**.
- **C** describes **KM (Knowledge Management)**.
- **D** correctly describes **SCM** — optimizing the entire flow from procurement to delivery.

---

# 2025A_FE-S_53

Which of the following is the appropriate explanation for **product innovation** in the management of technology?

a) Acquiring business profits through the achievements of technology development
b) Developing new products or products that enable differentiation from other companies
c) Making innovative reforms in business processes
d) Strategically managing business with technology as the core
?
**Answer: B**
### Step 1: Define product innovation

In technology management, **product innovation** refers to creating **new or significantly improved products** — either entirely new offerings or products that stand out from competitors through differentiation.

### Step 2: Eliminate other options

- **A** describes monetization of R&D (technology commercialization).
- **C** describes **process innovation** — reforming how things are done internally.
- **D** describes **technology strategy / MOT (Management of Technology)** in general.
- **B** specifically matches product innovation.

---

# 2025A_FE-S_54

Which of the following is a characteristic of MRP?

a) The development, designing, and production preparation of a product are performed simultaneously in parallel.
b) The number of required components is calculated on the basis of the standard production plan of a product.
c) The production of a product is initiated after an order from a customer is received.
d) Work instructions and transport instructions are provided by using a worksheet.
?
**Answer: B**
### Step 1: Define MRP

**Material Requirements Planning (MRP)** is a production planning system that calculates the materials and components needed to manufacture a product. It uses the **Master Production Schedule (standard production plan)** along with the **Bill of Materials (BOM)** to determine what components are required, in what quantities, and when.

### Step 2: Match to options

- **A** describes **concurrent engineering**.
- **B** correctly describes MRP — deriving component requirements from a production plan.
- **C** describes **make-to-order (pull) production**.
- **D** describes a **Kanban system**.

---

# 2025A_FE-S_56

A smart meter is a highly functional electricity meter with communications and device management functions. Which of the following is **not** an appropriate purpose for installing a smart meter?

a) Continuing the power supply for a fixed amount of time by functioning as an auxiliary power source during a power failure
b) Improving the efficiency of meter reading work through automatic meter reading
c) Increasing awareness of power-saving through the visualization of the amount of power consumption
d) Restraining peak power by controlling power demand through the use of demand response
?
**Answer: A**
### Step 1: Review smart meter capabilities

Smart meters can:
- Automatically transmit usage data (remote meter reading) ✓
- Display consumption data to encourage energy saving ✓
- Support demand response programs to shift or reduce peak load ✓

### Step 2: Identify the inappropriate purpose

Smart meters are **measurement and communication devices** — they do not store or supply electrical energy. Functioning as an **auxiliary power source** (like a UPS or battery backup) is completely outside their purpose. Option A is not an appropriate purpose.

---

# 2025A_FE-S_57

Which of the following is the appropriate role of a facilitator in a meeting?

a) To act as the chairperson and control the discussions in order to work out a conclusion that matches the intentions of the management
b) To encourage the meeting participants to express their opinions and organize the flow of discussions from a neutral and impartial position
c) To offer specialized support for meeting administration, such as adjusting the schedule, preparing materials, or taking minutes.
d) To provide advice only on discussions related to specific areas in which the facilitator specializes, such as technical or legal fields
?
**Answer: B**
### Step 1: Define a facilitator

A **facilitator** guides the process of a meeting — helping participants communicate, stay on topic, and reach conclusions — without imposing their own agenda. The key qualities are **neutrality** and **impartiality**.

### Step 2: Eliminate other options

- **A** describes a **chairperson** who steers toward a predetermined outcome.
- **C** describes a **meeting secretary/coordinator**.
- **D** describes a **subject matter expert or consultant**.
- **B** correctly describes a facilitator.

---

# 2025A_FE-S_59

Both Data mining and Process mining are methods for improving business operations. Which of the following is an appropriate explanation of **Process mining**?

a) It is a management strategy focused on changing workflows and business processes within an organization by emphasizing new ideas and new ways of doing business.
b) It is a method aimed at analyzing data sets, finding unsuspected relationships, and summarizing the data in novel ways.
c) It is a methodology for improving performance by systematically removing unnecessary data.
d) It is a technique for analyzing and improving business processes by using knowledge that is extracted from event logs.
?
**Answer: D**
### Step 1: Define process mining

**Process mining** uses **event log data** (records of activities in information systems) to reconstruct, analyze, and improve actual business processes. It reveals how processes really execute — not how they are supposed to work.

### Step 2: Match to options

- **A** describes **business process reengineering (BPR)**.
- **B** describes **data mining** (as stated in the question stem).
- **C** is not a recognized methodology.
- **D** correctly describes process mining — extracting process knowledge from event logs.

---

# 2025A_FE-S_60

Company A purchased a machine for an original cost of $126,000. The salvage value after 6 years is $6,000. What is the annual depreciation expense (in dollars) by using the straight-line method?

a) 12,000
b) 20,000
c) 21,000
d) 36,000
?
**Answer: B**
### Step 1: Recall the straight-line depreciation formula

$$\text{Annual Depreciation} = \frac{\text{Cost} - \text{Salvage Value}}{\text{Useful Life}}$$

### Step 2: Substitute values

$$\text{Annual Depreciation} = \frac{126{,}000 - 6{,}000}{6} = \frac{120{,}000}{6} = 20{,}000$$

---

# References
- [PhilNITS FE Examination](https://www.philnits.org/)
