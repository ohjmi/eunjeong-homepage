import { Box } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      w="100%"
      bg="white"
      boxShadow="0 -4px 12px rgba(0, 0, 0, 0.1)"
      zIndex={1000}
      p={4}
      color="black.500"
      textAlign="center"
      fontSize="sm"
    >
      © {new Date().getFullYear()} eunjeong Studio. All rights reserved.
    </Box>
  );
};

export default Footer;
