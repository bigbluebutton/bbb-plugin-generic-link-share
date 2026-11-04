import styled from 'styled-components';

const btnPrimaryColor = 'var(--btn-primary-color, #FFF)';
const btnPrimaryBg = 'var(--btn-primary-bg, var(--color-primary, #0F70D7))';
const btnPrimaryHoverBg = 'var(--btn-primary-hover-bg, #0C57A7)';

// Same look and place as the close button of the external video
export const CloseButton = styled.button`
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  cursor: pointer;
  border: none;
  border-radius: 2px;
  padding: .3rem .45rem;
  line-height: 1;
  font-size: 1rem;
  color: ${btnPrimaryColor};
  background-color: ${btnPrimaryBg};

  &:hover {
    background-color: ${btnPrimaryHoverBg};
  }

  &:focus-visible {
    outline: 2px solid ${btnPrimaryBg};
    outline-offset: 2px;
  }

  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;
