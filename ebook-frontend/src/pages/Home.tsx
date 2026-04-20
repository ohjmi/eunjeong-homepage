import { Box } from "@chakra-ui/react";
import Header from "../components/Header";
import Main from "../components/sections/Main";
import Aboutus from "../components/sections/Aboutus";
import Contact from "../components/sections/Contact";
import Products from "../components/sections/Products";
import Footer from "../components/Footer";
import "./Home.css";
import flower from "../assets/images/flower.svg";

const Home = () => {
  return (
    <>
      <Header />
      <Box className="scroll-container">
        <Box id="main" className="section">
          <Main />
        </Box>
        <Box
          id="aboutus"
          className="section"
          pt={{ base: "80px", md: "120px", lg: "150px" }}
          h="100vh"
          bgGradient="to-br"
          gradientFrom="#fff1e7"
          gradientTo="#f4fff3"
        >
          <Aboutus />
        </Box>

        <Box
          id="products"
          className="section"
          maxW="1280px"
          mx="auto"
          px={6}
          pt={{ base: "80px", md: "120px", lg: "150px" }}
        >
          <Products />
        </Box>

        <Box
          id="contact"
          className="section"
          pt={{ base: "80px", md: "120px", lg: "150px" }}
          style={{
            backgroundImage: `url(${flower})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Contact />
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Home;
