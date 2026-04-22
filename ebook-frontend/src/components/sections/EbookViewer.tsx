import { Flex, IconButton, useBreakpointValue, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";
import CodeAuthModal from "../modals/CodeAuth";

const MotionDiv = motion.div;

const BATCH_SIZE = 10;
const PREFETCH_THRESHOLD = 5;

interface Props {
  ebookId: number | undefined;
  onClose: () => void;
}

interface EbookResponse {
  urls: string[];
  totalPages: number;
}

const Page = ({
  src,
  isFlipping,
  direction,
  isLeft,
}: {
  src: string;
  isFlipping: boolean;
  direction: number;
  isLeft: boolean;
}) => {
  return (
    <MotionDiv
      style={{
        height: "85vh",
        transformStyle: "preserve-3d",
        transformOrigin: isLeft ? "right center" : "left center",
      }}
      animate={
        isFlipping
          ? {
              rotateY: direction === 1 ? (isLeft ? -180 : 0) : isLeft ? 0 : 180,
            }
          : { rotateY: 0 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <img
        src={src}
        style={{
          height: "100%",
          backfaceVisibility: "hidden",
        }}
      />
    </MotionDiv>
  );
};

const EbookViewer = ({ ebookId, onClose }: Props) => {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const queryClient = useQueryClient();

  const isDesktop = useBreakpointValue({
    base: false,
    xl: true,
  });

  // isPreviewMode: 미인증 상태면 프리뷰 API 사용
  const isPreviewMode = !isVerified;

  // 마운트 시 세션 확인
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.isVerified) setIsVerified(true);
      })
      .catch(() => {});
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<EbookResponse>({
      queryKey: isPreviewMode ? ["ebook-preview", ebookId] : ["ebook-full"],
      queryFn: async ({ pageParam = 1 }) => {
        if (isPreviewMode) {
          const res = await fetch(`/api/ebook/preview/${ebookId}`, {
            credentials: "include",
          });
          return res.json();
        }
        const res = await fetch(
          `/api/ebook/pages?start=${pageParam}&limit=${BATCH_SIZE}`,
          { credentials: "include" },
        );

        if (res.status === 401) {
          setIsVerified(false);
          setShowAuthModal(true);
          throw new Error("UNAUTHORIZED");
        }

        return res.json();
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (isPreviewMode) return undefined;
        const loadedCount = allPages.flatMap((p) => p.urls).length;
        const total = lastPage.totalPages;
        if (loadedCount >= total) return undefined;
        return loadedCount + 1;
      },
    });

  const allUrls = useMemo(() => {
    return data?.pages.flatMap((p) => p.urls) ?? [];
  }, [data?.pages]);

  const totalPages = data?.pages?.[0]?.totalPages ?? 0;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const isNearEnd = page >= allUrls.length - PREFETCH_THRESHOLD;
    if (isNearEnd) {
      const id = setTimeout(() => {
        fetchNextPage();
      }, 150);
      return () => clearTimeout(id);
    }
  }, [page, allUrls.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (allUrls.length === 0) return;
    const PRELOAD_COUNT = isDesktop ? 8 : 6;
    const start = page - 1;
    const end = Math.min(start + PRELOAD_COUNT, allUrls.length);
    for (let i = start; i < end; i++) {
      const img = new Image();
      img.src = allUrls[i];
    }
  }, [page, allUrls, isDesktop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const next = useCallback(() => {
    if (isFlipping) return;
    if (!isVerified && page >= 6) {
      setShowAuthModal(true);
      return;
    }
    setDirection(1);
    setIsFlipping(true);
    setTimeout(() => {
      setPage((prev) => {
        if (isDesktop) {
          if (prev === 1) return 2;
          if (prev + 2 <= totalPages) return prev + 2;
          return prev;
        }
        return prev < totalPages ? prev + 1 : prev;
      });
      setIsFlipping(false);
    }, 300);
  }, [isDesktop, totalPages, isFlipping, isVerified, page]);

  const prev = useCallback(() => {
    if (isFlipping) return;
    setDirection(-1);
    setIsFlipping(true);
    setTimeout(() => {
      setPage((prev) => {
        if (isDesktop) {
          if (prev === 2) return 1;
          if (prev - 2 >= 1) return prev - 2;
          return prev;
        }
        return prev > 1 ? prev - 1 : prev;
      });
      setIsFlipping(false);
    }, 300);
  }, [isDesktop, isFlipping]);

  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    trackMouse: true,
  });

  const { leftPage, rightPage } = useMemo(() => {
    if (!isDesktop || page === 1) {
      return { leftPage: page, rightPage: null };
    }
    const left = page % 2 === 0 ? page : page - 1;
    const right = left + 1 <= totalPages ? left + 1 : null;
    return { leftPage: left, rightPage: right };
  }, [page, isDesktop, totalPages]);

  if (isLoading && allUrls.length === 0) {
    return (
      <Flex
        position="fixed"
        inset="0"
        bg="blackAlpha.900"
        align="center"
        justify="center"
      >
        <Text color="gray" fontSize="xl">
          Loading...
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      position="fixed"
      inset="0"
      bg="blackAlpha.900"
      zIndex="9999"
      align="center"
      justify="center"
      style={{ perspective: "2000px" }}
      {...handlers}
    >
      <IconButton
        aria-label="close"
        position="absolute"
        top="24px"
        right="60px"
        onClick={onClose}
        bg="grey.100"
      >
        <X size={60} />
      </IconButton>

      <IconButton
        aria-label="previous"
        position="absolute"
        left="24px"
        zIndex="10"
        onClick={prev}
        // bg="gray.100"
      >
        <ChevronLeft size={28} />
      </IconButton>

      <Flex>
        {allUrls[leftPage - 1] && (
          <Page
            src={allUrls[leftPage - 1]}
            isFlipping={isFlipping}
            direction={direction}
            isLeft={true}
          />
        )}
        {rightPage && allUrls[rightPage - 1] && (
          <Page
            src={allUrls[rightPage - 1]}
            isFlipping={isFlipping}
            direction={direction}
            isLeft={false}
          />
        )}
      </Flex>

      <Text position="absolute" bottom="40px" color="gray.300" fontSize="sm">
        {leftPage}
        {rightPage ? ` - ${rightPage}` : ""} / {totalPages}
      </Text>

      <IconButton
        aria-label="next"
        position="absolute"
        right="24px"
        onClick={next}
        // bg="gray.100"
      >
        <ChevronRight size={28} />
      </IconButton>

      {showAuthModal && (
        <CodeAuthModal
          onSuccess={() => {
            setIsVerified(true);
            setShowAuthModal(false);
            // 인증 완료 후 전체 페이지 쿼리로 전환
            queryClient.invalidateQueries({ queryKey: ["ebook-full"] });
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </Flex>
  );
};

export default EbookViewer;
