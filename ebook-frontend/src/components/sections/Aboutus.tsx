import { Box, Heading, Text } from "@chakra-ui/react";
const Aboutus = () => {
  return (
    <Box maxW="1280px" mx="auto" px={6}>
      <Heading
        as="h1"
        fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
        mb={{ base: 6, md: 8, lg: 12 }}
      >
        About Us
      </Heading>

      <Text fontSize={{ base: "md", md: "xl", lg: "2xl" }} lineHeight="1.8">
        PoC는 두 사람으로 이루어진 콘텐츠 스튜디오입니다. 일단 만들어봅니다.
        생각이 정말로 작동하는지 확인합니다. 아직 정답은 없지만, 질문은
        분명합니다.
      </Text>
      <Text fontSize={{ base: "md", md: "xl", lg: "2xl" }} lineHeight="1.8">
        PoC is a two-person content studio. We start with ideas that linger—
        thoughts we couldn’t quite let go of. Instead of polishing them into
        conclusions, we turn them into small projects to see what happens when
        they exist in the real world.
      </Text>
    </Box>
  );
};

export default Aboutus;
