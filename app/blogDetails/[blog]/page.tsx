// pages/blogDetails/[id].js
"use client"
// import { useRouter } from 'next/router';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AdminNavbar from "@/component/AdminNavbar";
import { Editor, EditorState, convertFromRaw } from 'draft-js';

const BlogDetails = () => {

  // const router = useRouter();
  // const { id } = router.query;
  // console.log("🚀 ~ BlogDetails ~ id:", id)
  const pathname = usePathname()
  let slipts = pathname.split("/");
  const id = slipts[2];
 
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/api/blog_id?id=${id}`); // Replace with your API endpoint
        if (response) {
          // console.log("🚀 ~ fetchBlogs ~ response:", response.data.data)
          const data = response.data.data;
          setBlog(data);
          // setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        // setLoading(false);
      }
    };
  
    fetchBlogs();
  },[]);

  if (!blog) {
    return <p>Loading...</p>;
  } 

  const renderContent = (contentText:any) => {
    // console.log("🚀 ~ renderContent ~ contentText:", contentText)
    if (!contentText) {
      return <p>No content available</p>;
    }
  
    try {
      const contentState = convertFromRaw(JSON.parse(contentText));
      return <Editor editorState={EditorState.createWithContent(contentState)} readOnly onChange={() => {}} />;
    } catch (error) {
      console.error('Error parsing content:', error);
      return <p>Error rendering content</p>;
    }
  };
 const summary_img=blog?.summary_img?.slice(6);
  console.log("🚀 ~ BlogDetails ~ summary_img:", summary_img)
  return (
    <>
    <AdminNavbar/>
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Img variant="top" src={summary_img} alt={blog.title} />
            <Card.Body>
              <Card.Title>{blog.title}</Card.Title>
              <Card.Text>{renderContent(blog?.contents)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );

};

export default BlogDetails;
