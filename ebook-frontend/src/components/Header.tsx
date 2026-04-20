import { useState, useEffect, useRef } from "react";
import { Box, Button } from "@chakra-ui/react";

const Header = () => {
  const [activeSection, setActiveSection] = useState("main");
  const [menuOpen, setMenuOpen] = useState(false);
  const targetSectionRef = useRef<string | null>(null);
  const isFirstSection = activeSection === "main";

  const sections = [
    { name: "aboutus", label: "About Us" },
    { name: "products", label: "Products" },
    { name: "contact", label: "Contact" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (targetSectionRef.current) {
            if (id === targetSectionRef.current) {
              setActiveSection(id);
              targetSectionRef.current = null;
            }
          } else {
            setActiveSection(id);
          }
        });
      },
      { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    targetSectionRef.current = id;
    setActiveSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      w="100%"
      bg={isFirstSection ? "transparent" : "rgba(255,255,255,0.8)"}
      backdropFilter={isFirstSection ? "none" : "blur(30px)"}
      transition="background-color 0.3s ease, backdrop-filter 0.3s ease"
      boxShadow={isFirstSection ? "none" : "sm"}
      zIndex={1000}
      p={2}
    >
      <Box
        maxW="1280px"
        mx="auto"
        px={6}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
      >
        {/* 햄버거 버튼 - 모바일/태블릿만 표시 */}
        <Box display={{ base: "flex", lg: "none" }} alignItems="center">
          <Button
            variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            p={1}
            minW="auto"
            backgroundColor="transparent"
            _hover={{ backgroundColor: "transparent" }}
          >
            {menuOpen ? (
              <Box
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                lineHeight={1}
              >
                ✕
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap="5px">
                <Box w="22px" h="2px" bg="black" borderRadius="full" />
                <Box w="22px" h="2px" bg="black" borderRadius="full" />
                <Box w="22px" h="2px" bg="black" borderRadius="full" />
              </Box>
            )}
          </Button>
        </Box>

        {/* 로고 - 모바일에서 중앙, 데스크탑에서 왼쪽 */}
        <Box
          fontSize="xl"
          color="black"
          fontWeight="bold"
          cursor="pointer"
          onClick={() => scrollToSection("main")}
          position={{ base: "absolute", lg: "static" }}
          left={{ base: "50%", lg: "auto" }}
          transform={{ base: "translateX(-50%)", lg: "none" }}
        >
          LOGO
        </Box>

        {/* 데스크탑 nav */}
        <Box
          as="nav"
          display={{ base: "none", lg: "flex" }}
          fontSize={{ lg: "md", xl: "lg" }}
          gap={4}
        >
          {sections.map((section) => (
            <Button
              key={section.name}
              variant="ghost"
              color={
                isFirstSection
                  ? "black"
                  : activeSection === section.name
                    ? "#009768"
                    : "gray.700"
              }
              backgroundColor="transparent"
              fontWeight={activeSection === section.name ? "bold" : "normal"}
              onClick={() => scrollToSection(section.name)}
            >
              {section.label}
            </Button>
          ))}
        </Box>

        {/* 데스크탑 균형용 빈 Box */}
        <Box display={{ base: "none", lg: "block" }} w="80px" />
      </Box>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <Box display={{ base: "flex", lg: "none" }} flexDirection="column">
          {sections.map((section) => (
            <Button
              key={section.name}
              variant="ghost"
              justifyContent="flex-start"
              fontSize={{ base: "md", md: "lg" }}
              color={activeSection === section.name ? "#009768" : "gray.700"}
              fontWeight={activeSection === section.name ? "bold" : "normal"}
              backgroundColor="transparent"
              _hover={{ backgroundColor: "gray.50" }}
              onClick={() => scrollToSection(section.name)}
              w="full"
            >
              {section.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Header;
