import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { Login } from "../pages/Login.jsx";

const mockAuthLogin = jest.fn();

jest.mock("../api/authApi.js", () => ({
  login: jest.fn(),
}));

jest.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: mockAuthLogin,
  }),
}));

describe("Login page", () => {
  test("submits mobile/password and calls auth login", async () => {
    const user = userEvent.setup();
    const { login: loginApi } = await import("../api/authApi.js");
    loginApi.mockResolvedValue({ access_token: "t123" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/mobile number/i), "9000000001");
    await user.type(screen.getByLabelText(/password/i), "admin123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginApi).toHaveBeenCalledWith({ mobile_number: "9000000001", password: "admin123" });
    expect(mockAuthLogin).toHaveBeenCalledWith("t123");
  });
});

