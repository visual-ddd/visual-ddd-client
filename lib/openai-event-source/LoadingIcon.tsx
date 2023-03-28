export interface LoadingIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingIcon = (props: LoadingIconProps) => {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="20" cy="50" r="10" fill="#717171">
        <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="10" fill="#717171">
        <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="50" r="10" fill="#717171">
        <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};
