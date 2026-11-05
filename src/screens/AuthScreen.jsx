import { useState } from "react";
import KaiLogo from "./KaiLogo.jsx";

export default function AuthScreen({ vm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e) => {
    e.preventDefault();
    vm.submitAuth(email, password);
  };

  return (
    <div className="flow-page auth">
      <KaiLogo className="page-logo" />
      <form className="auth__form" onSubmit={submit} noValidate>
        <h1 className="auth__title">{vm.isSignup ? "Create your account" : "Log in"}</h1>
        <div className="flex col gap-8px">
          <label className="t-13px" htmlFor="auth-email">Email</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@25madison.com" required />
        </div>
        <div className="flex col gap-8px">
          <label className="t-13px" htmlFor="auth-password">Password</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="auth-password" type="password" autoComplete={vm.isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={vm.isSignup ? "At least 8 characters" : ""} required />
        </div>
        {vm.authError && <p className="auth__error" role="alert">{vm.authError}</p>}
        <button className="btn btn--primary auth__submit" type="submit" disabled={vm.authBusy}>{vm.isSignup ? "Create account" : "Log in"}</button>
        <p className="auth__switch">
          {vm.isSignup ? "Already have an account? " : "New here? "}
          <button className="link-btn" type="button" onClick={vm.toggleAuthMode}>{vm.isSignup ? "Log in" : "Create an account"}</button>
        </p>
        <p className="auth__note">Prototype: accounts are stored only in this browser. Don't reuse a real password.</p>
      </form>
    </div>
  );
}
