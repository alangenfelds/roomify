import { Box } from "lucide-react";
import { useOutletContext } from "react-router";
import { Button } from "./ui/Button";

const Navbar = () => {
  const { isSignedIn, userName, signOut, signIn } =
    useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (err) {
        console.error("Puter - error signing out ", err);
      }
      return;
    }

    try {
      await signIn();
    } catch (err) {
      console.error("Puter - error signing in ", err);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>

          <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </ul>
        </div>

        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Signed in"}
              </span>

              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleAuthClick}>
                Log In
              </Button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
