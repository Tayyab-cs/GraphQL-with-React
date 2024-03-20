import { useEffect, useState } from "react";
import {
  blogsByType,
  blogByCategory,
  getBlog,
  listBlogs,
} from "../../graphql/queries.js";
import { generateClient } from "aws-amplify/api";
import { createBlog, deleteBlog, updateBlog } from "../../graphql/mutations.js";
import { Select, Table } from "antd";
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
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Category",
    dataIndex: "cat",
    key: "category",
  },
];

const Blogs = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectCat, setSelectCat] = useState("");

  console.log("search: ", search);

  useEffect(() => {
    const createSub = API.graphql({
      query: subscriptions.onCreateBlog,
    }).subscribe({
      next: ({ data }) => {
        console.log("sub data: ", data);
        fetchBlogs();
      },
      error: (error) => console.log("Subscription error: ", error),
    });

    const updateSub = API.graphql({
      query: subscriptions.onUpdateBlog,
    }).subscribe({
      next: ({ data }) => {
        console.log("sub data: ", data);
        fetchBlogs();
      },
      error: (error) => console.log("Subscription error: ", error),
    });

    const deleteSub = API.graphql({
      query: subscriptions.onDeleteBlog,
    }).subscribe({
      next: ({ data }) => {
        console.log("sub data: ", data);
        fetchBlogs();
      },
      error: (error) => console.log("Subscription error: ", error),
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  const fetchBlogs = async () => {
    const res = await API.graphql({
      query: listBlogs,
    });
    setBlogs(res.data.listBlogs.items);
    console.log("Blogs: ", res.data.listBlogs.items);
  };

  useEffect(() => {
    if (search && selectCat) {
      handleBlogByCategory();
    } else if (search && !isNaN(search)) {
      handleBlogById();
    } else if (search) {
      handleBlogByType();
    } else {
      fetchBlogs();
    }
  }, [search, selectCat]);

  const handleBlogById = async () => {
    const res = await API.graphql({
      query: getBlog,
      variables: {
        id: search,
      },
    });

    console.log("blog by id: ", res);
    setBlogs([res.data.getBlog]);
  };

  const handleBlogByType = async () => {
    const res = await API.graphql({
      query: blogsByType,
      variables: {
        type: search,
      },
    });

    console.log("blogs by type: ", res);
    setBlogs(res.data.blogsByType.items);
  };

  const handleBlogByCategory = async () => {
    const res = await API.graphql({
      query: blogByCategory,
      variables: {
        name: { eq: search },
        cat: selectCat,
      },
    });

    console.log("blogs by category or name: ", res);
    setBlogs(res.data.blogByCategory.items);
  };

  const handleBlogCreate = async () => {
    try {
      const res = await API.graphql({
        query: createBlog,
        variables: {
          input: {
            id: id,
            name: name,
            description: description,
            type: type,
            cat: cat,
          },
        },
      });
      console.log("create res: ", res);
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
            description: description,
            type: type,
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3>Description</h3>
          <input
            placeholder="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <h3>Type</h3>
          <input
            placeholder="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3>Category</h3>
          <input
            placeholder="cat"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
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
        <button onClick={handleBlogCreate}>save</button>
        <button onClick={handleBlogUpdate}>update</button>
        <button onClick={handleBlogDelete}>delete</button>
      </div>
      <div style={{ padding: "10px 0px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <h3>Search:</h3>
          <input
            placeholder="search by id or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <h3>Category:</h3>
          <Select
            // defaultValue="game"
            placeholder="category"
            style={{
              width: 120,
            }}
            onChange={(value) => {
              setSelectCat(value);
            }}
            options={[
              {
                value: "game",
                label: "game",
              },
              {
                value: "video",
                label: "video",
              },
              {
                value: "movie",
                label: "movie",
              },
              {
                value: "food",
                label: "food",
              },
            ]}
          />
        </div>
        <h2>Blogs Table</h2>
        <Table
          dataSource={blogs.map((item, index) => {
            return {
              key: index,
              id: item.id,
              name: item.name,
              description: item.description,
              type: item.type,
              cat: item.cat,
            };
          })}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Blogs;
