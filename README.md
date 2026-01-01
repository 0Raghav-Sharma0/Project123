<!-- ========================== INTRODUCTION ========================== -->

<h1 align="center">🧾 Invoice Management System</h1>

<p align="center">
  <strong>
    A production-ready GST invoice creation, preview, and pixel-perfect PDF export platform
  </strong>
</p>

<p align="center">
  Invoice Management System is a full-stack web application that enables businesses to
  create, manage, preview, and download professional GST-compliant invoices.
</p>

<p align="center">
  The project focuses on real-world financial workflows, accurate tax calculations,
  and <strong>reliable A4 PDF generation without layout breakage</strong>.
</p>

<p align="center">
  🚀 <strong>Live Demo:</strong><br/>
  <a href="https://project123-beta-ten.vercel.app" target="_blank">
    https://project123-beta-ten.vercel.app
  </a>
</p>

<hr/>

<!-- ========================== SCREENSHOTS ========================== -->

<h2>📸 Screenshots</h2>

<p>
  Below are key screens from the application highlighting invoice creation,
  real-time preview, invoice listing, and PDF export.
</p>

<p align="center">
  <img width="420" src="https://github.com/user-attachments/assets/6d350f5c-be15-45c7-b33c-549156d92019" />
  <img width="420" src="https://github.com/user-attachments/assets/ef9afc07-6dfe-4d68-ab01-dda66ed9c9d4" />
</p>

<p align="center">
  <img width="420" src="https://github.com/user-attachments/assets/ad6f4ba6-a918-4619-97ac-09872bacf21c" />
  <img width="420" src="https://github.com/user-attachments/assets/7194177e-9207-45bb-92f0-35608577dd25" />
</p>

<p align="center">
  <img width="420" src="https://github.com/user-attachments/assets/287d440e-69eb-46ca-b99e-165256094fd7" />
  <img width="420" src="https://github.com/user-attachments/assets/01d676a4-7a74-4995-98f7-967773edfcab" />
</p>

<hr/>

<!-- ========================== TECH STACK ========================== -->

<h2>🛠️ Tech Stack</h2>

<table>
  <thead>
    <tr>
      <th align="left">Layer</th>
      <th align="left">Technologies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>React, Material UI (MUI)</td>
    </tr>
    <tr>
      <td><strong>State Management</strong></td>
      <td>Redux Toolkit</td>
    </tr>
    <tr>
      <td><strong>Routing</strong></td>
      <td>React Router</td>
    </tr>
    <tr>
      <td><strong>PDF Generation</strong></td>
      <td>html2pdf.js, html2canvas, jsPDF</td>
    </tr>
    <tr>
      <td><strong>Backend</strong></td>
      <td>Node.js, Express</td>
    </tr>
    <tr>
      <td><strong>Database</strong></td>
      <td>MongoDB, Mongoose</td>
    </tr>
    <tr>
      <td><strong>Formatting</strong></td>
      <td>INR currency (en-IN), GST calculations</td>
    </tr>
  </tbody>
</table>

<hr/>

<!-- ========================== CORE FEATURES ========================== -->

<h2>✨ Core Features</h2>

<table>
  <thead>
    <tr>
      <th align="left">Feature</th>
      <th align="left">Description</th>
      <th align="center">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Invoice Creation</strong></td>
      <td>Create GST-compliant invoices with multiple line items</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td><strong>GST Calculation</strong></td>
      <td>Automatic CGST & SGST calculation with precise round-off handling</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td><strong>Live Invoice Preview</strong></td>
      <td>A4-sized preview that exactly matches the final PDF output</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td><strong>PDF Export</strong></td>
      <td>One-click generation of print-ready, non-breaking invoices</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td><strong>Invoice Status</strong></td>
      <td>Draft, Generated, Paid, and Overdue workflow management</td>
      <td align="center">✅</td>
    </tr>
    <tr>
      <td><strong>Invoice Management</strong></td>
      <td>Edit, delete, search, filter, and download invoices</td>
      <td align="center">✅</td>
    </tr>
  </tbody>
</table>

<hr/>

<!-- ========================== PDF ARCHITECTURE ========================== -->

<h2>🖨️ PDF Accuracy & Architecture</h2>

<p>
  A major engineering focus of this project is <strong>PDF reliability</strong>.
</p>

<p>
  Instead of generating PDFs from separate templates or raw HTML strings,
  the system follows a <strong>single source of truth</strong> approach:
</p>

<ul>
  <li>The same React component renders the on-screen invoice</li>
  <li>The same DOM tree is captured for PDF export</li>
  <li>No color mismatch, overflow cutting, or layout shifting</li>
</ul>

<p>
  The PDF pipeline is carefully tuned for:
</p>

<ul>
  <li>Exact A4 dimensions</li>
  <li>Consistent margins and spacing</li>
  <li>Safe scaling across devices</li>
  <li>Predictable page breaks</li>
</ul>

<hr/>

<!-- ========================== DEPLOYMENT ========================== -->

<h2>🚀 Deployment</h2>

<ul>
  <li>
    <strong>Frontend:</strong> Deployed on Vercel for fast, global access.
  </li>
  <li>
    <strong>Backend:</strong> Hosted on Render as a long-running Node.js service.
  </li>
  <li>
    <strong>Environment:</strong> Separate development and production configurations
    using environment variables.
  </li>
</ul>

<hr/>

<!-- ========================== FUTURE IMPROVEMENTS ========================== -->

<h2>📌 Future Improvements</h2>

<ul>
  <li>Email invoices directly to customers</li>
  <li>Automatic multi-page invoice splitting</li>
  <li>Company branding with logo and theme customization</li>
  <li>PDF watermarking and digital signatures</li>
  <li>Bulk invoice export and reporting</li>
</ul>
