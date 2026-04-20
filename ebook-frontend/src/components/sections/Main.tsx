import { Box, Heading, Text } from "@chakra-ui/react";
import mainBg from "../../assets/videos/bg_summer.mp4";
import "./Main.css";

const Main = () => {
  return (
    <Box className="main-container">
      <video className="background-video" autoPlay loop muted playsInline>
        <source src={mainBg} type="video/mp4" />
      </video>

      <Box className="overlay-content">
        <Heading
          as="h1"
          fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
          color="black"
          mb={4}
        >
          Welcome to Eunjeong Site
        </Heading>
        <Text fontSize={{ base: "md", md: "xl", lg: "2xl" }} color="black">
          Amazing experiences await
        </Text>
      </Box>
    </Box>
  );
};

export default Main;
