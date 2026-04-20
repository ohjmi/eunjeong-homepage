import { useParams } from "react-router-dom";
import EbookViewer from "../components/sections/EbookViewer";

const EbookPage = () => {
  const { ebookId } = useParams();

  return (
    <EbookViewer ebookId={Number(ebookId)} onClose={() => window.close()} />
  );
};

export default EbookPage;
