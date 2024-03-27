"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

// import { ContentState, Editor } from "react-draft-wysiwyg";
import dynamic from "next/dynamic"; // (if using Next.js or use own dynamic loader)

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  RawDraftContentState,
} from "draft-js";
import { ToastContainer } from "react-toastify";

import AdminNavbar from "@/component/AdminNavbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';
import { ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs'
const htmlToDraft = typeof window === 'object' && require('html-to-draftjs').default;

export default function Home() {
  const [blog, setBlog] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [summaryImage, setSummaryImage] = useState<File>();
  const [headerImage, setHeaderImage] = useState<File>();
  const [imagess, setImagess] = useState<any>([])
  // modal img
  const [currentImage, setCurrentImage] = useState(null)
  const [currentHeaderImg, setcurrentHeaderImg] = useState(null)
  const [currentSummaryImg, setcurrentSummaryImg] = useState(null)
  //  modals
  const [mymodal, setMyModal] = useState(false)
  const [HeaderModal, setHeaderModal] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);

  const [deletedImg, setDeletedImages] = useState<any>([]);
  const [newImg, setNewImg] = useState<any>([]);

  const [loading, setLoading] = useState(false);
  const [bodyImages, setBodyImages] = useState<FileList | null>(null);
  const [updated, setUpdated] = useState(false);

  const [blogId, setblogId] = useState<number>();
  const [status, setStatus] = useState<any>();
  // 
  const [content, setContent] = useState(() => EditorState.createEmpty());
  const [htmlContent, sethtmlContent] = useState(draftToHtml(convertToRaw(content.getCurrentContent())));
  const [code, setCode] = useState(false);


  const url = process.env.NEXT_PUBLIC_URL;
  let images: any = [];
  let cancel_imgs: any = [];

  const pathname = usePathname()
  let slipts = pathname.split("/");
  const id = slipts[2];
  const router = useRouter();

  const editorStyle = {
    height: "150px", // Adjust the height as needed
    border: "1px solid #ddd", // Add border or any other styles
    padding: "10px", // Add padding if desired
  };

  const convertContent = (rich: any) => {
    const contentFromJSON = JSON.parse(rich);
    const contentState = convertFromRaw(contentFromJSON);
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/api/blog_id?id=${id}`); // Replace with your API endpoint
        if (response) {
          const data = response.data.data;
          console.log("🚀 ~ fetchBlogs ~ data:", data)
          setBlog(data);
          setTitle(data.title);
          setDetails(data.details)
          setImagess(data.body_imgs)
          setHeaderImage(data.header_img)
          setSummaryImage(data.summary_img)
          setBodyImages(data.body_imgs)
          setblogId(data.id);
          const contentState = convertFromRaw(JSON.parse(data.contents));;
          setEditorState(EditorState.createWithContent(contentState));
          setStatus(data.id)
        }
      } catch (error) {
        console.error('Error at updating :', error);
        // setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

  const handleUpdateClick = async (e: any) => {
    e.preventDefault()
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const contentAsJSON = JSON.stringify(rawContentState);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("details", details);
    formData.append("summaryImage", summaryImage ?? '');
    formData.append("content", contentAsJSON);
    formData.append("headerImage", headerImage ?? '');
    formData.append("blog_id", id);
    // appending fileList of old body images 
    if (bodyImages) {
      console.log("🚀 ~ handleUpdateClick ~ bodyImages:", bodyImages)
      for (let i = 0; i < bodyImages.length; i++) {
        formData.append("oldImages[]", bodyImages[i]);
      }
    }
    // appending fileList of new  images 
    if (newImg) {
      console.log("🚀 ~ handleUpdateClick ~ imagess:", newImg)
      for (let i = 0; i < newImg.length; i++) {
        formData.append("newImages[]", newImg[i]);
      }
    }
    // appending cancelled images
    if (deletedImg) {
      console.log("🚀 ~ handleUpdateClick ~ deletedImg:", deletedImg)
      for (let i = 0; i < deletedImg.length; i++) {
        // console.log("formData >> cancelled images >> ", deletedImg[i]);
        formData.append("deletedImages[]", deletedImg[i]);
      }
    }
    function validate_form() {
      console.log("under form validation")
      let isValid = true;
      if (!title) { bugs.title = 'Please fill title !'; isValid = false; }
      if (!details) { bugs.details = 'Please fill details !'; isValid = false; }
      if (contentAsJSON.length < 1) { bugs.details = 'Please fill content !'; isValid = false; console.log("contennnnnnn") }
      if (!headerImage) { bugs.header_img = 'Please insert header_img !'; isValid = false; }
      if (!summaryImage) { bugs.header_img = 'Please insert sumary_img!'; isValid = false; }
      return isValid;
    }
    try {
      // Make a PUT request to the update API endpoint
      if (validate_form()) {
        const token = localStorage.getItem('token');
        const response = await axios.put('/api/blog', formData, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 200) {
          toast.success("Blog Successfully Updated !")
          setUpdated(true);
          // router.push(`/veiwBlogs`)
        }
      }
      else {
        console.log("bugs ", bugs)
        toast.error("Please fill the form correctly !")
      }
      // Handle success, e.g., display a success message
    } catch (error) {
      console.error('Error updating blog:', error);   // Handle error, e.g., display an error message
    }
    finally {
      setLoading(false);
    }
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
  const handleCancel = (image_: File) => {
    if (image_) {
      cancel_imgs.push(image_)
      console.log("🚀 ~ handleCancel ~ cancel_imgs:", cancel_imgs)
      setDeletedImages((img: any) => [cancel_imgs[0], ...(img),]);
      // setDeletedImages((img: any) => [cancel_imgs[0], ...(img),]);
      setImagess(imagess.filter((curent_img: File) => curent_img !== image_))
      console.log("🚀 ~ 217```````````````````` cancel_imgs:", cancel_imgs)
    }
  }
  const handleNewImageCancel = (image_: File) => {
    setNewImg(newImg.filter((curent_img: File) => curent_img !== image_))
  }
  const handleNewImages = (e: any) => {
    const body_path = e.target.files?.[0];
    console.log("body path is : ", body_path)
    // if (body_path) {setBodyImages(body_path);}
    if (body_path) {
      if (body_path) {
        images.push(body_path)
        console.log("images pushed in  new array exisst and they are : ", images)
        // setBodySingleImage(null);
        setNewImg((prev: any) => [images[0], ...prev,])
      }
      else {
        console.log("images doesn't exist")
      }
    }

  }
  const showImages = (modal: boolean, images: any) => {
    console.log("show images", images)
    setMyModal(modal)
    setCurrentImage(images)
    console.log("image is --168--preview ", images)
  }
  const showHeader = (modal: boolean, images: any) => {
    console.log("show header", images)
    setHeaderModal(modal)
    setcurrentHeaderImg(images);
    console.log("image is --168--preview ", images)
  }
  const showSummary = (modal: boolean, images: any) => {
    console.log("show summary", images)
    setSummaryModal(modal)
    setcurrentSummaryImg(images);
    console.log("image is --168--preview ", images)
  }
  const handlePreview = () => {
    const blogId = blog.id;
    window.open(`http://localhost:3000/blogPreview/${blogId}`, '_blank');

  }
  const handlePublish = async () => {
    const publishDetails = { blogId: blogId }
    console.log("🚀 ~ publishDetails:", publishDetails)
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
  const showCode = () => {
    setCode(true);
  }
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

  console.log("new images : ", images, "state of new images ", newImg)
  console.log("cancel images : ", cancel_imgs, "state of deleted array : ", deletedImg)
  console.log("new  : ", newImg, " ")
  // console.log("blog~~~~",blog.id  )
  return (
    <>
      <ToastContainer />
      <AdminNavbar />
      <Container fluid>
        <Row className="mt-5 px-3">
          {/* {blog?.map((blog:any) => ( */}
          <Col md={{ span: 12 }} className=" p-3 rounded  border">
            <h2>Update Blog</h2>

            <Form>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title "
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
                {summaryImage ? <Button variant="secondary" onClick={() => showSummary(true, summaryImage)}>
                  Preview Summary Image Uploaded
                </Button> : ''}
              </Form.Group>


              {/* header image */}
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Header Image</Form.Label>
                <Form.Control type="file" onChange={handleHeaderImage} name="headerImage" accept="image/*" />
                {headerImage ? <Button variant="secondary" onClick={() => showHeader(true, headerImage)}>
                  Preview Header Image Uploaded
                </Button> : ''}
              </Form.Group>

              {/* body images */}
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Body Images</Form.Label>
                <Form.Control type="file" onChange={(e) => handleNewImages(e)} name="bodyImage" accept="image/*" multiple />
              </Form.Group>
              {imagess.length > 0 || newImg.length > 0 ?
                <>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Preview</th>
                        <th>URL</th>
                        <th>Cancel</th>
                      </tr>
                    </thead>
                    {imagess && imagess.length > 0 &&
                      <tbody>
                        {Array.from(imagess).map((image: any, index) => (
                          <tr>
                            {/* <td>{index + 1}</td> */}
                            <td></td>
                            <td>{image.name ? image.name : image.slice(17)}</td>
                            <td>
                              <Button variant="outline-secondary" onClick={() => showImages(true, image)}>Preview</Button>{' '}
                            </td>
                            <td>{image.name ? `${url}${image.name}` : `${url}${image.slice(15)}`}</td>
                            <td>
                              <Button variant="outline-secondary" onClick={() => handleCancel(image)}>Cancel</Button>{' '}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    }
                    {newImg && newImg.length > 0 &&
                      <tbody>
                        {Array.from(newImg).map((image: any, index) => (
                          <tr>
                            {/* <td>{index + 1}</td> */}
                            <td></td>

                            <td>{image.name ? image.name : image.slice(17)}</td>
                            <td>
                              <Button variant="outline-secondary" onClick={() => showImages(true, image)}>Preview</Button>{' '}
                            </td>
                            <td>{image.name ? `${url}${image.name}` : `${url}${image.slice(15)}`}
                            </td>

                            <td>
                              <Button variant="outline-secondary" onClick={() => handleNewImageCancel(image)}>Cancel</Button>{' '}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    }
                  </Table>
                </>
                : ''
              }
              <div className="container">
                <div className="row">
                  <div className="col-md-3 w-100">
                    <Button variant="primary" className="mt-2" type="submit" onClick={(e) => { handleUpdateClick(e) }}>  Update Blog</Button>
                  </div>
                  {updated ?
                    <>
                      <div className="col-md-3 w-100">
                        <Button variant="primary" className="mt-2" onClick={handlePreview}>Preview</Button>
                      </div>
                      <div className="col-md-3 w-100">
                        <Button variant="primary" className="mt-2" onClick={handlePublish}>Publish</Button>
                      </div>
                    </>
                    : ''}
                  <div className="col-md-3 w-100">
                  {blog?.status === 'Published' ? <h5 className="text-success">{blog?.status}</h5> : <h5 className="text-warning"> {blog?.status}</h5>} 
                  </div>
                </div>
              </div>
            </Form>
          </Col>
        </Row>
        {/* modal  of body images*/}
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
            {/* {currentImage && <img src={URL.createObjectURL(currentImage)} alt="image to upload" style={{ width: '100%', margin: 'auto' }} />} */}
            {/* {(typeof currentImage === 'string') ? <img src={(currentImage as string).slice(7)} /> : <img src={URL.createObjectURL(currentImage)} alt="image to upload" style={{ width: '100%', margin: 'auto' }} />} */}
            {currentImage !== null ? (
              typeof currentImage === 'string' ? (
                <img src={(currentImage as string).slice(6)} alt="image to upload" style={{ width: '100%', margin: 'auto' }} />
              ) : (
                <img src={URL.createObjectURL(currentImage)} alt="image to upload" style={{ width: '100%', margin: 'auto' }} />
              )
            ) : (
              // Handle the case when currentImage is null, for example, show a placeholder or do nothing
              null
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setMyModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* modal of header image */}
        <Modal
          show={HeaderModal}
          size="sm"
          aria-labelledby="contained-modal-title-vcenter"
          centered >
          <Modal.Header >
            <Modal.Title id="contained-modal-title-vcenter">
              {/* {props.image} */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ margin: "auto" }}>
            {currentHeaderImg ? (
              typeof currentHeaderImg === 'string' ? (
                <img src={(currentHeaderImg as string).slice(6)} style={{ width: '100%' }} />) : (<>
                  <img src={URL.createObjectURL(currentHeaderImg)} style={{ width: '100%' }} /></>
              )
            ) : (
              null
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setHeaderModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* modal of summary image */}
        <Modal
          show={summaryModal}
          size="sm"
          aria-labelledby="contained-modal-title-vcenter"
          centered >
          <Modal.Header >
            <Modal.Title id="contained-modal-title-vcenter">
              {/* {props.image} */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ margin: "auto" }}>
            {/* {currentSummaryImg? (<img src={(currentSummaryImg as string ).slice(6)}/>): 'aaaaaa'} */}
            {currentSummaryImg ? (
              typeof currentSummaryImg === 'string' ? (
                <img src={(currentSummaryImg as string).slice(6)} style={{ width: '100%' }} />) : (<>
                  <img src={URL.createObjectURL(currentSummaryImg)} style={{ width: '10s0%' }} /></>)) : (null)}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setSummaryModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </>
  );
}
