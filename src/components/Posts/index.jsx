import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getPost, listPosts, postByCategory } from "../../graphql/queries.js";
import { createPost, deletePost, updatePost } from "../../graphql/mutations.js";
import { Input, Select, Table } from "antd";

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
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Category",
    dataIndex: "cat",
    key: "cat",
  },
];

const typeOptions = [
  {
    value: "public",
    label: "Public",
  },
  {
    value: "private",
    label: "Private",
  },
];

const catOptions = [
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
];

const Posts = () => {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [posts, setPosts] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectType, setSelectType] = useState("");
  const [selectCat, setSelectCat] = useState("");

  const fetchPosts = async () => {
    const res = await API.graphql({
      query: listPosts,
    });
    setPosts(res.data.listPosts.items);
    console.log("Posts: ", res.data.listPosts.items);
  };

  useEffect(() => {
    console.log("title, type: ", searchTitle, selectType);
    if (searchTitle && selectType) {
      handlePostsbyCategory();
    }
    fetchPosts();
  }, [selectCat, searchTitle, selectType]);

  const handlePostsbyCategory = async () => {
    const res = await API.graphql({
      query: postByCategory,
      variables: {
        cat: selectCat,
        titleType: { eq: { title: searchTitle, type: selectType } },
        // titleType: { title: { eq: searchTitle }, type: { eq: selectType } },
        sortDirection: "ASC",
      },
    });

    console.log("posts by category: ", res);

    if (res) setPosts(res.data.postByCategory.items);
  };

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
          type: type,
          cat: cat,
        },
      },
    });

    console.log("post created: ", res);

    if (res) fetchPosts();
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
          <h3>Type: </h3>
          <input
            placeholder="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <h3>category:</h3>
          <input
            placeholder="category"
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
        <button onClick={handlePostCreate}>save</button>
        <button onClick={handlePostUpdate}>update</button>
        <button onClick={handlePostDelete}>delete</button>
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
        <Input
          placeholder="select title"
          value={searchTitle}
          style={{
            width: 120,
          }}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <Select
          // defaultValue="lucy"
          placeholder="select type"
          style={{
            width: 120,
          }}
          onChange={(value) => setSelectType(value)}
          options={typeOptions}
        />

        <Select
          placeholder="category"
          style={{
            width: 120,
          }}
          onChange={(value) => {
            setSelectCat(value);
          }}
          options={catOptions}
        />
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
              type: item.type ?? "",
              cat: item.cat ?? "",
            };
          })}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Posts;
