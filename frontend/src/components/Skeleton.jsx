// frontend/src/components/Skeleton.jsx
export default function Skeleton({ height = "16px", width = "100%", radius = "8px" }) {
  return (
    <div
      className="skeleton"
      style={{
        height,
        width,
        borderRadius: radius,
      }}
    ></div>
  );
}
