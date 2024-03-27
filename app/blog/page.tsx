"use client";
import Image from "next/image";

import styles from "./page.module.css";
import { useState, useEffect, ChangeEvent, ChangeEventHandler } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
// import { ContentState, Editor } from "react-draft-wysiwyg";
import dynamic from "next/dynamic"; // (if using Next.js or use own dynamic loader)
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

import { EditorState, convertToRaw, convertFromRaw, RawDraftContentState, } from "draft-js";
import { ToastContainer } from "react-toastify";
import AdminNavbar from "@/component/AdminNavbar";
import axios from "axios";
import { toast } from "react-toastify";
import { type } from "os";
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';
import { ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs'
const htmlToDraft = typeof window === 'object' && require('html-to-draftjs').default;
// import { stateToHTML } from 'draft-js-export-html';
// import { stateFromHTML } from 'draft-js-import-html';


require("dotenv").config

export default function Home() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [content, setContent] = useState(() => EditorState.createEmpty());
  // const [imageUrl, setImageUrl] = useState("");
  const [summaryImage, setSummaryImage] = useState<File>();
  const [headerImage, setHeaderImage] = useState<File>();
  const [bodyImages, setBodyImages] = useState<FileList | null>(null);
  const [rich, setRich] = useState("");
  const [imagess, setImagess] = useState<any>([])
  const [mymodal, setMyModal] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [status, setStatus] = useState('draft');
  const [blogId, setBlogId] = useState();
  const [createdBy, setCreatedBy] = useState('');
  // created_status
  const [blogSaved, setBlogSaved] = useState(false);
  const [convertedContent, setConvertedContent] = useState(null);
  const [htmlContent, sethtmlContent] = useState(draftToHtml(convertToRaw(content.getCurrentContent())));
  // uploaded_img
  const [uploaded, setUploaded] = useState<boolean>(false);
  // html code editor
  const [code, setCode] = useState(false);
  interface dataType {
    image: File,
    status: boolean
  }
  const [body_, setBody_] = useState<dataType[]>([]);
  let images: any = [];
  const url = process.env.NEXT_PUBLIC_URL;
  interface bug {
    title: string;
    details: string;
    content: string;
    header_img: string;
    summary_img: string;
  }

  let bugs: bug = {
    title: "",
    details: "",
    content: "",
    header_img: "",
    summary_img: ""
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("status is ", status)
    const rawContentState = convertToRaw(content.getCurrentContent());
    console.log("🚀 ~ handleSubmit ~ rawContentState:", rawContentState)
    const contentAsJSON = JSON.stringify(rawContentState);
    console.log("🚀 ~ handleSubmit ~ contentAsJSON:", contentAsJSON)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("details", details);
    formData.append("summaryImage", summaryImage ?? '');
    formData.append("content", contentAsJSON);
    formData.append("headerImage", headerImage ?? '');
    formData.append("status", status);
    formData.append("Operation", "save");


    // appending fileList of images 
    if (imagess) {
      for (let i = 0; i < imagess.length; i++) {
        console.log("formData >> bodyImages >> ", imagess[i]);
        formData.append("bodyImages[]", imagess[i]);
      }
    }
    function validate_form() {
      let isValid = true;
      if (!title) { bugs.title = 'Please fill title !'; isValid = false; }
      if (!details) { bugs.details = 'Please fill details !'; isValid = false; }
      if (contentAsJSON.length < 1) { bugs.details = 'Please fill content !'; isValid = false; console.log("contennnnnnn") }
      if (!headerImage) { bugs.header_img = 'Please insert header_img !'; isValid = false; }
      if (!summaryImage) { bugs.header_img = 'Please insert sumary_img!'; isValid = false; }
      console.log("form validated or not ? ", isValid, " bugs present", bugs)
      return isValid;

    }
    try {
      if (validate_form()) {
        const token = localStorage.getItem('token');
        const response = await axios.post("/api/blog", formData, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 200) {
          console.log("🚀 ~ handleSubmit ~ response.data.:", response.data)
          const blogID = response.data.blog_id;
          const username = response.data.username;
          setBlogSaved(true);
          setBlogId(blogID)
          setCreatedBy(username);
          toast.success("Blog created successfully");
          setContent(() => EditorState.createEmpty());
          // setDetails("");
          // setTitle("");
          // setBodyImages(null);
          // setHeaderImage(undefined);
          // setSummaryImage(undefined);

        }
      }
      else {
        toast.error("Please fill form")
      }
    }
    catch (error) {
      console.log("error at creating new blog ", error)
    }
  };
  const editorStyle = {
    height: "300px", // Adjust the height as needed
    border: "1px solid #ddd", // Add border or any other styles
    padding: "10px", // Add padding if desired
  };
  const convertContent = (rich: any) => {
    const contentFromJSON = JSON.parse(rich);
    const contentState = convertFromRaw(contentFromJSON);
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
  };
  const handleTextAreaChange = (event: any) => {
    const htmlContent = event.target.value;
    sethtmlContent(htmlContent);
    const blocksFromHtml = htmlToDraft(htmlContent);
    const contentState = ContentState.createFromBlockArray(
      blocksFromHtml.contentBlocks,
      blocksFromHtml.entityMap
    );
    const newEditorState = EditorState.createWithContent(contentState);
    setContent(newEditorState);
  };

  const handleEditorStateChange = (newState: any) => {
    setContent(newState);
    const newContent = draftToHtml(convertToRaw(content.getCurrentContent()));
    sethtmlContent(newContent);


    // You can also get the content in HTML or plain text if needed
    // const contentInHtml = draftToHtml(convertToRaw(newState.getCurrentContent()));
    // const contentInText = newState.getCurrentContent().getPlainText();
  };
  const handleSummaryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let summary_path = e.target.files?.[0];
    console.log("🚀 ~ Home ~ summary_path:", summary_path)
    if (summary_path) {
      setSummaryImage(summary_path);
    }


  }
  const handleHeaderImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let header_path = e.target.files?.[0];
    console.log("🚀 ~ Home ~ header_path:", header_path)
    if (header_path) {
      setHeaderImage(header_path)
    }

  }
  const handleBodyImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const body_path = e.target.files?.[0];
    console.log("body path is : ", body_path)
    // if (body_path) {setBodyImages(body_path);}
    if (body_path) {
      if (body_path) {
        images.push(body_path)
        console.log("images pushed in array exisst and they are : ", images)
        setImagess((prev: any) => [images[0], ...prev,])
        console.log("body state : ", images)
        setBody_(prev => [...prev, { image: body_path, status: false }]);


      }
      else {
        console.log("images doesn't exist")
      }
    }
  }

  const handleUpload = async (img: File) => {
    const formData = new FormData();
    formData.append("bodyImg", img);
    formData.append("OperationType", "Upload_Body_Images");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post("/api/blog", formData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        toast.success("Image Uploaded")
        // 
        body_.map((img_) => {
          if (img_?.image === img) {
            const updatedImg = body_.map(imgs => imgs.image === img ? { ...imgs, status: true } : imgs)
            setBody_(updatedImg)

          }
        })
      }
    }
    catch (error) {
      console.log("error at creating new blog ", error)
    }
    console.log("🚀 ~ body_:", body_)

  }
  const handleCancel = (image_: File) => {
    console.log("imagesssssssssss : ", image_)
    setImagess(imagess.filter((curent_img: File) => curent_img !== image_))
  }
  const showImages = (modal: boolean, images: any) => {
    console.log("show images")
    setMyModal(modal)
    setCurrentImage(images)
  }

  const publish = async () => {
    setStatus('Published');
    const publishDetails = { blogId: blogId }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch("/api/blog", publishDetails, { headers: { Authorization: `Bearer ${token}` } });

      if (response.status === 200) {

      }
      else {
        toast.error("Please fill form")
      }
    }
    catch (error) {
      console.log("error at creating new blog ", error)
    }

  }
  const preview = async () => {
    console.log("PATCH ~ ", blogId)
    window.open(`http://localhost:3000/blogPreview/${blogId}`, '_blank');

  }
  const uploadImageCallBack = (file: File) => {
    return new Promise((resolve, reject) => {
      // Example of uploading the file to a server
      const formData = new FormData();
      formData.append('file', file);

      fetch('YOUR_UPLOAD_ENDPOINT', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          // Assuming the server responds with an object containing the image URL
          resolve({ data: { link: data.url } });
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          reject('Error uploading image');
        });
    });
  };
  const showCode = () => {
    setCode(true);
  }

  console.log("🚀 ~ body_:", body_)


  return (
    <>
      <ToastContainer />
      <AdminNavbar />
      <Container fluid>
        <Row className="mt-5 px-3">
          <Col md={{ span: 12 }} className=" p-3 rounded  border">
            <h2>Create a New Blog</h2>

            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="details">
                <Form.Label>Details</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="content">
                <Form.Label>
                  <div className="row d-flex align-items-center mt-3">
                    <div className="col" ><Button variant="outline-secondary" onClick={() => { setCode(false) }}>Content</Button></div>
                    <div className="col"><Button variant="outline-secondary" onClick={showCode}>Code</Button></div>
                  </div>
                </Form.Label>
                {!code ?
                  <Editor editorState={content}
                    // toolbarClassName="toolbarClassName"
                    // wrapperClassName="wrapperClassName"
                    // editorClassName="editorClassName"
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbarClassName="toolbar-class"
                    editorStyle={editorStyle}
                    onEditorStateChange={handleEditorStateChange}
                  />
                  :
                  <Form.Control
                    as="textarea"
                    placeholder="Place your HTML Tags"
                    // onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>{setContent(e.target.value)}}
                    // value={draftToHtml(convertToRaw(content?.getCurrentContent()))}
                    // value={htmlContent}
                    // onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>{sethtmlContent(e.target.value)}}
                    value={htmlContent}
                    onChange={handleTextAreaChange}
                    style={{ height: '300px' }}
                  />
                }

              </Form.Group>

              {/* upload summary image */}
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Summary Image</Form.Label>
                <Form.Control type="file" onChange={handleSummaryImage} name="summaryImage" accept="image/*" />
              </Form.Group>

              {/* header image */}
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Header Image</Form.Label>
                <Form.Control type="file" onChange={handleHeaderImage} name="headerImage" accept="image/*" />
              </Form.Group>

              {/* body images */}
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Body Images</Form.Label>
                <Form.Control type="file" onChange={handleBodyImages} name="bodyImage" accept="image/*" multiple />
              </Form.Group>
              {imagess && imagess.length > 0 &&
                <Table striped bordered hover size="sm">

                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Preview</th> 
                      <th>Upload</th>
                      <th>Cancel</th>
                    </tr>
                  </thead>

                  <tbody>
                 <>{console.log("body state total images are : ",body_ ,"and imagesss ", imagess)}</>
                    {/* {Array.from(imagess).map((image: any, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{image.name}</td>
                        <td> <Button variant="outline-secondary" onClick={() => showImages(true, image)}>Preview</Button>{' '}</td>
                        {
                          image.uploaded ?
                            <>
                              <>{console.log("upload state : ", uploaded)}</>
                              <td>{url}/{image.name}</td>
                            </>
                            :
                            <>
                              <>{console.log("upload state : ", uploaded)}</>
                              <td>  <Button variant="outline-primary w-100" onClick={() => handleUpload(image)}>Upload</Button>{' '}</td>
                              <td>  <Button variant="outline-danger w-100" onClick={() => handleCancel(image)}>Cancel</Button>{' '}</td>
                            </>
                        }
                      </tr>
                    ))} */}

                      {Array.from(body_).map((image: any, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{image.image.name}</td>
                        <td> <Button variant="outline-secondary" onClick={() => showImages(true, image.image)}>Preview</Button>{' '}</td>
                        { image.status ===true?
                            <>
                              <>{console.log("upload state after upload  : ",image.status )}</>
                              <td>{url}{image.image.name}</td> 
                            </>
                            :
                            <>
                              <>{console.log("upload state : ", image.status)}</>
                              <td>  <Button variant="outline-primary w-50 " onClick={() => handleUpload(image.image)}>Upload</Button>{' '}</td>
                              <td>  <Button variant="outline-danger w-100" onClick={() => handleCancel(image.image)}>Cancel</Button>{' '}</td>
                            </>
                        }

                      </tr>
                    ))}
                    

                  </tbody>
                </Table>
              }



              <div className="d-flex w-50 justify-content-around align-items-end  " >
                <Button variant="primary" className="mt-2" type="submit">
                  Create Blog
                </Button>

                {blogSaved ?
                  <>
                    <Button variant="primary" className="mt-2" onClick={preview}>
                      Preview
                    </Button>

                    <Button variant="primary" className="mt-2" onClick={publish}>
                      Publish
                    </Button>

                    {createdBy ? <h6> <strong>CREATED BY -</strong> {createdBy}</h6> : ''}
                  </>
                  : null}
                {status === 'Published' ? <h5 className="text-success">Published</h5> : <h5 >Draft</h5>}

              </div>

            </Form>
          </Col>
        </Row>

        {/* modal */}
        <Modal
          show={mymodal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered >
          <Modal.Header >
            <Modal.Title id="contained-modal-title-vcenter">
              {/* {props.image} */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentImage && <img src={URL.createObjectURL(currentImage)} alt="image to upload" style={{ width: '100%', margin: 'auto' }} />}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setMyModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </>
  );// import createResizablePlugin from 'draft-js-resizeable-plugin';

}
