import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import Link from "next/link";
const AdminNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="">Admin Dashboard</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/veiwBlogs">Home</Nav.Link>
          <Nav.Link href="/blog">Create Blogs</Nav.Link>
          {/* <Nav.Link href="#users">Users</Nav.Link> */}
          {/* Add more Nav.Link components for additional sections */}
        </Nav>
        {/* <Nav className="ml-auto">
          <Nav.Link href="#profile">Profile</Nav.Link>
          <Nav.Link href="#logout">Logout</Nav.Link>
        </Nav> */}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AdminNavbar;
