import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getPost, listPosts } from "../../graphql/queries.js";
import { createPost, deletePost, updatePost } from "../../graphql/mutations.js";
import { Table } from "antd";

const API = generateClient();

const columns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  // {
  //   title: "Blog Id",
  //   dataIndex: "blogId",
  //   key: "blogId",
  // },
  // {
  //   title: "Blog Name",
  //   dataIndex: "blogName",
  //   key: "blogName",
  // },
];

const Posts = () => {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [blogId, setBlogId] = useState("");
  const [blogName, setBlogName] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await API.graphql({
        query: listPosts,
      });
      setPosts(res.data.listPosts.items);
      console.log("Posts: ", res.data.listPosts.items);
    };
    fetchPosts();
  }, []);

  const handlePostById = async () => {
    const res = await API.graphql({
      query: getPost,
      variables: {
        id: id,
      },
    });

    console.log("post: ", res);
  };

  const handlePostCreate = async () => {
    const res = await API.graphql({
      query: createPost,
      variables: {
        input: {
          id: id,
          title: title,
          // blog: {
          //   id: blogId,
          //   name: blogName,
          // },
        },
      },
    });

    console.log("post created: ", res);
  };

  const handlePostUpdate = async () => {
    const res = await API.graphql({
      query: updatePost,
      variables: {
        input: {
          id: id,
          title: title,
        },
      },
    });

    console.log("update post: ", res);
  };

  const handlePostDelete = async () => {
    const res = await API.graphql({
      query: deletePost,
      variables: {
        input: {
          id: id,
        },
      },
    });

    console.log("deleted post: ", res);
  };

  return (
    <div>
      <h1>POSTS</h1>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3>Id: </h3>
          <input
            placeholder="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <h3>Title: </h3>
          <input
            placeholder="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3>Blog Id: </h3>
          <input
            placeholder="id"
            value={blogId}
            onChange={(e) => setBlogId(e.target.value)}
          />
          <h3>Blog Name: </h3>
          <input
            placeholder="blog name"
            value={blogName}
            onChange={(e) => setBlogName(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          padding: "10px 0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <button onClick={handlePostCreate}>save</button>
        <button onClick={handlePostUpdate}>update</button>
        <button onClick={handlePostDelete}>delete</button>
      </div>

      <div style={{ padding: "10px 0px" }}>
        <h2>Posts Table</h2>
        <Table
          dataSource={posts.map((item, index) => {
            console.log("post with blogs: ", item);
            return {
              key: index,
              id: item.id,
              title: item.title,
              // blogId: item.blog.id,
              // blogName: item.blog.name,
            };
          })}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Posts;
