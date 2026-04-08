import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

jest.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    loading: false,
    isAuthenticated: false,
    role: null,
    token: null,
  }),
}));

describe("ProtectedRoute", () => {
  test("redirects to /login when token missing", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Navigate renders an anchor-less redirect; we can assert the child isn't shown.
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });
});

