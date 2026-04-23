import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Button,
} from "@chakra-ui/react";

import product1 from "../../assets/images/product1.png";
import product2 from "../../assets/images/product2.png";

type Product = {
  id: number;
  title: string;
  description: string;
  image: string;
  hasViewer?: boolean;
  ebookId?: number;
};

const Products = () => {
  const products: Product[] = [
    {
      id: 1,
      title: "Product One",
      description: "This is a short description.",
      image: product1,
      hasViewer: true,
      ebookId: 3, // ← DB ebooks.id 값
    },
    {
      id: 2,
      title: "Product Two",
      description: "This is a short description.",
      image: product2,
      hasViewer: false,
    },
  ];

  return (
    <>
      <Heading
        as="h1"
        textAlign="center"
        mb={{ base: 6, md: 12 }}
        fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
      >
        Products
      </Heading>

      <Box>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          gap={{ base: 4, md: 8 }}
          maxW="1280px"
          mx="auto"
          px={{ base: 4, md: 6 }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-8px)", boxShadow: "xl" }}
              cursor={product.hasViewer ? "default" : "pointer"}
              onClick={() => {
                if (!product.hasViewer) {
                  // TODO: 추후 페이지 이동 처리
                  console.log("상품 클릭:", product.id);
                }
              }}
            >
              <Image
                width="100%"
                h={{ base: "200px", md: "250px", lg: "300px" }}
                objectFit="cover"
                src={product.image}
                alt={product.title}
              />
              <Box textAlign="left" p={{ base: 4, md: 6 }}>
                <Heading color="black" size={{ base: "sm", md: "md" }} mb={2}>
                  {product.title}
                </Heading>
                <Text
                  color="gray.600"
                  fontSize={{ base: "sm", md: "md" }}
                  mb={4}
                >
                  {product.description}
                </Text>

                {/* 미리보기 버튼 */}
                {product.hasViewer && (
                  <Button
                    size="sm"
                    fontSize="14px"
                    justifyContent="flex-start"
                    width="100%"
                    padding="0"
                    textAlign="left"
                    background="transparent"
                    color="gray.600"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/ebook/${product.ebookId}`, "_blank");
                    }}
                  >
                    ebook 미리보기
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default Products;
