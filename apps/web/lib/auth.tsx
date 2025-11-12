"use client";

import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  useAuth as useClerkAuth,
} from "@clerk/nextjs";

const mockAuthEnabled = process.env.NEXT_PUBLIC_AUTH_MOCK === "true";

type SignedChildren = ComponentProps<typeof ClerkSignedIn>["children"];

type MockButtonProps = {
  children?: ReactNode;
};

type MockUserButtonProps = {
  appearance?: Record<string, unknown>;
};

type UseAuthResult = ReturnType<typeof useClerkAuth>;

type AppAuth = {
  AppAuthProvider: ({ children }: PropsWithChildren) => ReactNode;
  SignedIn: ({ children }: { children: SignedChildren }) => ReactNode;
  SignedOut: ({ children }: { children: SignedChildren }) => ReactNode;
  SignInButton: (props: ComponentProps<typeof ClerkSignInButton>) => ReactNode;
  SignUpButton: (props: ComponentProps<typeof ClerkSignUpButton>) => ReactNode;
  UserButton: (props: ComponentProps<typeof ClerkUserButton>) => ReactNode;
  useAppAuth: () => UseAuthResult | {
    isLoaded: true;
    isSignedIn: true;
    getToken: () => Promise<string>;
  };
};

function renderSignedChildren(children: SignedChildren) {
  return typeof children === "function" ? (children as (props: unknown) => ReactNode)({}) : children;
}

function createMockAuth(): AppAuth {
  const mockToken = async () => "test-token";
  const baseAuthState = {
    isLoaded: true as const,
    isSignedIn: true as const,
  };

  return {
    AppAuthProvider: ({ children }) => <>{children}</>,
    SignedIn: ({ children }) => <>{renderSignedChildren(children)}</>,
    SignedOut: () => null,
    SignInButton: ({ children }: MockButtonProps) => (
      <button type="button" className="rounded-full bg-white/10 px-3 py-1 text-sm text-white" disabled>
        {children ?? "Sign in"}
      </button>
    ),
    SignUpButton: ({ children }: MockButtonProps) => (
      <button type="button" className="rounded-full border border-white/40 px-3 py-1 text-sm text-white" disabled>
        {children ?? "Create account"}
      </button>
    ),
    UserButton: ({ appearance }: MockUserButtonProps) => (
      <div data-testid="user-button" className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-200 text-xs font-semibold text-indigo-900">
        TU
      </div>
    ),
    useAppAuth: () => ({
      ...baseAuthState,
      getToken: mockToken,
    }),
  };
}

function createClerkAuth(): AppAuth {
  return {
    AppAuthProvider: ({ children }) => <ClerkProvider>{children}</ClerkProvider>,
  SignedIn: ({ children }) => <ClerkSignedIn>{children as ReactNode}</ClerkSignedIn>,
  SignedOut: ({ children }) => <ClerkSignedOut>{children as ReactNode}</ClerkSignedOut>,
    SignInButton: (props) => <ClerkSignInButton {...props} />,
    SignUpButton: (props) => <ClerkSignUpButton {...props} />,
    UserButton: (props) => <ClerkUserButton {...props} />,
    useAppAuth: () => useClerkAuth(),
  };
}

const authImpl = mockAuthEnabled ? createMockAuth() : createClerkAuth();

export const AppAuthProvider = authImpl.AppAuthProvider;
export const SignedIn = authImpl.SignedIn;
export const SignedOut = authImpl.SignedOut;
export const SignInButton = authImpl.SignInButton;
export const SignUpButton = authImpl.SignUpButton;
export const UserButton = authImpl.UserButton;
export const useAppAuth = authImpl.useAppAuth;
