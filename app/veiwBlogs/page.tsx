"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from "react-toastify";
import dynamic from "next/dynamic";
import AdminNavbar from "@/component/AdminNavbar";
import axios from 'axios';
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BlogsPage() {
  const router = useRouter();
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [blogs, setBlogs] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [buttonloading, setButtonLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>();
  let data: object = {};
  console.log("🚀 ~ BlogsPage ~ selectedBlog:", selectedBlog)



  const handleUpdateClick = (blog: any) => {
    // setLoading(true);
    // try {
    //   // Make a PUT request to the update API endpoint
    //   const response = await axios.put('/api/blog', formData);
    //   console.log(response.data); // Log the response
    //   // Handle success, e.g., display a success message
    // } catch (error) {
    //   console.error('Error updating blog:', error);
    //   // Handle error, e.g., display an error message
    // } finally {
    //   setLoading(false);
    // }
    router.push(`/updateBlog/${blog}`)
  };

  const handleViewClick = (blog: any) => {
    // setSelectedBlog(blog);
    router.push(`/blogDetails/${blog}`)
  };

  const handleDeleteClick = async (id: any) => {

    setButtonLoading(true);
    try {
      console.log("🚀 ~ handleDeleteClick ~ handleDeleteClick:")
      const token = localStorage.getItem('token');
      const response = await axios.delete('/api/blog', { data: { id }, headers: { Authorization: `Bearer ${token}` } });// Pass the blog ID in the request body
      console.log("🚀 ~ handleDeleteClick ~ response:", response)
      if (response.status == 200) {
        console.log("🚀 ~ STATUS IS 200 ON DELETE CLICK")
        setConfirmDelete(false);
        toast.success('Blog deleted successfully')

      }

    }
    catch (error) {
      console.error('Error deleting blog:', error);
      // Handle error, e.g., display an error message
    }
    finally {
      setButtonLoading(false);

    }
  };
  const handleconfirmDelete = async (id: number) => {
    // setConfirmDelete(true);
    setConfirmDelete({ show: true, id: id });
  }
  const handleClose = () => {
    setConfirmDelete(false);
  }

  const handleImgs = (data: any) => {
    // console.log("🚀 ~ BlogsPage ~ data:", data)
    const img_urls = data.map((data: any) => ({
      summary_url: data.summary_img,
      header_url: data.header_img
    }))
    console.log("🚀 ~ const img_urls=data.map ~ img_urls:", img_urls)
    return
  }

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("/api/blog"); // Replace with your API endpoint
        //console.log("🚀 ~ fetchBlogs ~ response.data:", response.data); // Log response data
        if (response) {
          data = response.data.data; // No need to await response.data here
          console.log("🚀 ~ fetchBlogs ~ data:", data)
          handleImgs(data);
          setBlogs(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [buttonloading]);

  const handlePreview=(id:number)=>
  {
    console.log("PATCH ~ ", id)
    window.open(`http://localhost:3000/blogPreview/${id}`, '_blank');

  }

  return (
    <>
      <ToastContainer />
      <AdminNavbar />
      <Container fluid>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Row className="mt-5 justify-content-center">
            {blogs?.length > 0 ? (
              blogs.map((blog: any) => (
                <Col md={{ span: 4 }} className="p-3 " key={blog?.id}>
                  <div className="rounded border text-center p-4">
                    <>{console.log("blog summary image : ", blog?.summary_img?.slice(6))}</>
                    <Image
                      src={blog?.summary_img?.slice(6)}
                      alt={blog?.title}
                      className="img-fluid rounded-top"
                      width={400}
                      height={300}
                    />
                    <div className="p-3">
                      <h5>{blog?.title}</h5>
                      <div>{blog?.details}</div>
                      <div className='d-flex justify-content-between w-100 '>
                        <Button variant="outline-secondary" className='w-20' onClick={() => handleUpdateClick(blog.id)}>Update</Button>
                        <Button variant="outline-danger"   className='w-20'onClick={() => handleconfirmDelete(blog.id)} disabled={buttonloading}>Delete</Button>
                        <Button variant="outline-secondary"  className='w-20'onClick={() => handleViewClick(blog.id)}>View</Button>
                        <Button variant="outline-secondary"  className='w-20'onClick={() => handlePreview(blog.id)}>Preview</Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <>
              <h3 className='text-secondary text-center'>No blogs found !</h3>
              </>
            )}

          </Row>)}
      </Container>

      {/* modal for confirm delete */}
      <Modal show={confirmDelete} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this blog ?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDeleteClick(confirmDelete.id)}>
            Delete
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};
