import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/image", () => {
  type NextImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
  };

  const MockedImage: React.FC<NextImageProps> = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...rest } = props;
    return React.createElement("img", { ...rest, alt: props.alt || "mocked image" });
  };

  return {
    __esModule: true,
    default: MockedImage,
  };
});

jest.mock("next-auth/react", () => ({
  __esModule: true,
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

jest.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const handleApiErrorMock = jest.fn();
jest.mock("@/lib/services/errors/errors", () => ({
  handleApiError: handleApiErrorMock,
}));

jest.mock('next-auth', () => {
  const mockFn = jest.fn(() => ({
    handlers: {},
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }));

  return {
    __esModule: true,
    default: mockFn,
    getServerSession: jest.fn(() => Promise.resolve({ user: { id: 'mockUser' } })),
  };
});

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock('@auth/core', () => ({}));
jest.mock('@auth/core/providers/credentials', () => ({}));
