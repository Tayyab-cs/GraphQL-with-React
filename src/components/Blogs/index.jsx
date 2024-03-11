import { useEffect, useState } from "react";
import { getBlog, listBlogs } from "../../graphql/queries.js";
import { generateClient } from "aws-amplify/api";
import { createBlog, deleteBlog, updateBlog } from "../../graphql/mutations.js";
import { Table } from "antd";
import { onCreateBlog } from "../../graphql/subscriptions.js";
import * as subscriptions from "../../graphql/subscriptions.js";

const API = generateClient();

const columns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
];

const Blogs = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    const res = await API.graphql({
      query: listBlogs,
    });
    setBlogs(res.data.listBlogs.items);
    console.log("Blogs: ", res.data.listBlogs.items);
  };
  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleBlogById = async () => {
    const res = await API.graphql({
      query: getBlog,
      variables: {
        id: id,
      },
    });

    console.log("blog: ", res);
  };

  const handleBlogCreate = async () => {
    try {
      const res = await API.graphql({
        query: createBlog,
        variables: {
          input: {
            id: id,
            name: name,
          },
        },
      });
      console.log("create res: ", res);

      createSub = await API.graphql({
        query: subscriptions.onCreateBlog,
      }).subscribe({
        next: ({ data }) => {
          console.log("sub data: ", data);
          fetchBlogs();
        },
        error: (error) => console.log("Subscription error: ", error),
      });

      createSub.unsubscribe();
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleBlogUpdate = async () => {
    try {
      const res = await API.graphql({
        query: updateBlog,
        variables: {
          input: {
            id: id,
            name: name,
          },
        },
      });

      console.log("update blog: ", res);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleBlogDelete = async () => {
    try {
      const res = await API.graphql({
        query: deleteBlog,
        variables: {
          input: {
            id: id,
          },
        },
      });

      console.log("deleted blog: ", res);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  console.log("Blog DataL: ", id, name);

  return (
    <div>
      <h1>BLOGS</h1>
      <div>
        <h3>Id</h3>
        <input
          placeholder="id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <h3>Name</h3>
        <input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div style={{ padding: "10px 0px" }}>
        <button onClick={handleBlogCreate}>save</button>
        <button onClick={handleBlogUpdate}>update</button>
        <button onClick={handleBlogDelete}>delete</button>
      </div>
      <div style={{ padding: "10px 0px" }}>
        <h2>Blogs Table</h2>
        <Table
          dataSource={blogs.map((item, index) => {
            return { id: item.id, name: item.name, key: index };
          })}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Blogs;
