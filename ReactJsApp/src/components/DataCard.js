import React from 'react';
import './DataCard.css';

const DataCard = ({ post }) => {
  return (
    <div className="data-card">
      <div className="card-header">
        <span className="post-id">#{post.id}</span>
        <span className="user-id">User {post.userId}</span>
      </div>
      <h3 className="card-title">{post.title}</h3>
      <p className="card-body">{post.body}</p>
      <div className="card-footer">
        <span className="timestamp"> Just now </span>
      </div>
    </div>
  );
};

export default DataCard;