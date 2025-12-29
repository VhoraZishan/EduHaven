import { useParams } from "react-router-dom";

function PostDetail() {
  const { id } = useParams();
  return <h2>Post Detail: {id}</h2>;
}

export default PostDetail;
