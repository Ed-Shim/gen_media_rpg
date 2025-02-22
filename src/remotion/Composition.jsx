import { AbsoluteFill, OffthreadVideo } from "remotion";

export const MyComposition = ({ text }) => {
  return (
    <AbsoluteFill>
      <div style={{ backgroundColor: "black", color: "white" }}>
        Hello {text}!
      </div>
    </AbsoluteFill>
  );
};
