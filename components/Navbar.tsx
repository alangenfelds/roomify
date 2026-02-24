import { Box } from "lucide-react";
import { useOutletContext } from "react-router";
import { Button } from "./ui/Button";

const Navbar = () => {
  const { isSignedIn, userName, signOut, signIn } =
    useOutletContext<AuthContext>();

  const handleAuthclick = async () => {
    if (isSignedIn) {
      try {
        signOut();
      } catch (err) {
        console.error("Puter - error signing out ", err);
      }
    } else {
      try {
        await signIn();
      } catch (err) {
        console.error("Puter - error signing in ", err);
      }
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

              <Button size="sm" onClick={handleAuthclick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleAuthclick}>
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
