import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  Button,
  HStack,
  Icon,
  Link,
} from "@chakra-ui/react";
import { FiMail, FiInstagram, FiTwitter } from "react-icons/fi";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [form, setForm] = useState({
    from_name: "",
    from_email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
      setForm({ from_name: "", from_email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <Box maxW="1280px" mx="auto" px={{ base: 4, md: 6 }} textAlign="center">
      <Heading
        as="h1"
        mb={{ base: 4, md: 6 }}
        fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
      >
        Contact
      </Heading>

      <Text
        fontSize={{ base: "md", md: "xl", lg: "2xl" }}
        mb={{ base: 6, md: 10 }}
        color="gray.700"
      >
        여러분의 생각을 듣고 싶어요
      </Text>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="#fff7dd"
        borderRadius="2xl"
        p={{ base: 4, md: 6, lg: 8 }}
        boxShadow="lg"
        maxW={{ base: "100%", md: "70%", lg: "50%" }}
        mx="auto"
      >
        <VStack gap={4}>
          <Input
            bg="white"
            border="none"
            name="from_name"
            placeholder="이름"
            value={form.from_name}
            onChange={handleChange}
            required
          />
          <Input
            bg="white"
            border="none"
            name="from_email"
            type="email"
            placeholder="이메일"
            value={form.from_email}
            onChange={handleChange}
            required
          />
          <Textarea
            bg="white"
            border="none"
            name="message"
            placeholder="메시지를 입력해주세요"
            value={form.message}
            onChange={handleChange}
            required
            resize="none"
            h={{ base: "120px", md: "160px", lg: "200px" }}
          />

          <Button
            type="submit"
            colorScheme="green"
            w="full"
            loading={status === "sending"}
            loadingText="전송 중..."
          >
            전송
          </Button>

          {status === "success" && (
            <Text color="green.500">메시지가 성공적으로 전송되었습니다!</Text>
          )}
          {status === "error" && (
            <Text color="red.500">오류가 발생했습니다. 다시 시도해주세요.</Text>
          )}
        </VStack>

        {/* 아이콘 묶음 - 모바일에서 세로로 */}
        <VStack gap={4} mt={{ base: 6, md: 10, lg: 24 }} align="center">
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            alignItems={{ base: "flex-start", md: "center" }}
            justifyContent="center"
            gap={{ base: 3, md: 6 }}
          >
            <HStack gap={4}>
              <Icon as={FiMail} boxSize={{ base: 4, md: 6 }} />
              <Link
                href="mailto:hello@poc.com"
                fontSize={{ base: "sm", md: "md" }}
              >
                hello@poc.com
              </Link>
            </HStack>

            <HStack gap={4}>
              <Icon as={FiInstagram} boxSize={{ base: 4, md: 6 }} />
              <Link href="#" fontSize={{ base: "sm", md: "md" }}>
                @pocstudio
              </Link>
            </HStack>

            <HStack gap={4}>
              <Icon as={FiTwitter} boxSize={{ base: 4, md: 6 }} />
              <Link href="#" fontSize={{ base: "sm", md: "md" }}>
                @pocstudio
              </Link>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default Contact;
