import { useState } from "react";
import { Flex, Input, Button, Text } from "@chakra-ui/react";

type Props = {
  onSuccess: () => void;
  onClose: () => void;
};

const CodeAuthModal = ({ onSuccess, onClose }: Props) => {
  const [step, setStep] = useState<"code" | "otp" | "confirm">("code");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code) return;
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("/api/auth/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.status === "success") {
        onSuccess();
        onClose();
      }

      if (data.status === "device_change") {
        setStep("otp");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // OTP 성공 → 확인 팝업으로
      setStep("confirm");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDevice = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("/api/auth/confirm-device", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch("/api/otp/resend", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      setError("재발송 실패");
    }
  };

  return (
    <Flex
      position="fixed"
      inset="0"
      bg="blackAlpha.700"
      zIndex="9999"
      align="center"
      justify="center"
    >
      <Flex
        bg="white"
        p="24px"
        borderRadius="md"
        direction="column"
        gap="12px"
        minW="300px"
      >
        {step === "code" && (
          <>
            <Text fontWeight="bold">코드 입력</Text>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyCode();
              }}
            />
            {error && <Text color="red.500">{error}</Text>}
            <Flex gap="8px">
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                bg="transparent"
                border="1px solid gray"
                color="black"
                onClick={onClose}
              >
                닫기
              </Button>
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                bg="black"
                onClick={handleVerifyCode}
                loading={isLoading}
                disabled={!code}
                cursor={!code ? "not-allowed" : "pointer"}
              >
                인증하기
              </Button>
            </Flex>
          </>
        )}

        {step === "otp" && (
          <>
            <Text fontWeight="bold">이메일 인증</Text>
            <Text fontSize="sm">이메일로 받은 6자리 코드를 입력하세요</Text>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6자리 코드"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyOtp();
              }}
            />
            {error && <Text color="red.500">{error}</Text>}
            <Button
              bg="transparent"
              color="black"
              fontSize="sm"
              size="sm"
              onClick={handleResendOtp}
            >
              코드 다시 받기
            </Button>
            <Flex gap="8px">
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                bg="transparent"
                border="1px solid gray"
                color="black"
                onClick={onClose}
              >
                닫기
              </Button>
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                onClick={handleVerifyOtp}
                loading={isLoading}
                disabled={!otp}
                cursor={!otp ? "not-allowed" : "pointer"}
              >
                인증하기
              </Button>
            </Flex>
          </>
        )}

        {step === "confirm" && (
          <>
            <Text fontWeight="bold">기기 변경 확인</Text>
            <Text fontSize="sm">
              다른 기기에서 이미 로그인되어 있습니다. 현재 기기로 계속
              진행하시겠습니까?
            </Text>
            {error && <Text color="red.500">{error}</Text>}
            <Flex gap="8px">
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                bg="transparent"
                border="1px solid gray"
                color="black"
                onClick={onClose}
              >
                취소
              </Button>
              <Button
                flex={1}
                size="sm"
                fontSize="sm"
                bg="black"
                onClick={handleConfirmDevice}
                loading={isLoading}
              >
                확인
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default CodeAuthModal;
