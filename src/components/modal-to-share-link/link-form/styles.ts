import styled, { css } from 'styled-components';
import { ButtonStyleProps, FormToSendUrlItemProps } from './types';

const colorGray = 'var(--color-gray, #4E5A66)';
const borderSizeSmall = '1px';
const borderSize = '2px';
const colorGrayLightest = 'var(--color-gray-lightest, #D4D9DF)';
const lineHeightComputed = '1rem';
const mdPaddingX = '1rem';

const colorDanger = 'var(--color-danger, #DF2721)';
const colorDangerDark = 'var(--color-danger-dark, #AE1010)';

export const ButtonsWrapper = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

// Kept apart from Cancel and Share, on the other side, as it ends the share for everyone
export const StopSharingButton = styled.button`
  margin-right: auto;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  border: 3px solid transparent;
  border-radius: 2px;
  font-weight: 600;
  font-size: calc(1rem * 0.85);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  padding: 0.45rem 1rem;
  color: #fff;
  background-color: ${colorDanger};

  &:hover {
    background-color: ${colorDangerDark};
  }

  &:focus-visible {
    box-shadow: 0 0 0 ${borderSize} ${colorDanger};
  }
`;

export const ButtonStyle = styled.button<ButtonStyleProps>`
  border: 3px solid transparent;
  overflow: visible;
  display: inline-block;
  border-radius: 2px;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  padding: 0.45rem 1rem;
  align-self: flex-start;

  ${({ color }) => color === 'secondary' && `
    background: transparent;
    color: ${colorGray};
    border: 3px solid transparent;
    border-radius: 4px;
  

    &:focus {
      background: hsl(210, 30%, 95%);
      box-shadow: 0 0 0 ${borderSize} hsl(211, 87%, 80%);
    }

    &:hover {
      background: hsl(210, 30%, 95%);
      color: hsl(210, 13%, 35%);
    }

    &:active {
      background: hsl(210, 30%, 89%);
      color: hsl(210, 13%, 30%);
    }

    &:hover {
      &:focus {
        background: hsl(210, 30%, 95%);
        color: hsl(210, 13%, 30%);
        box-shadow: 0 0 0 ${borderSize} hsl(211, 87%, 80%);
      }
    }

    &:focus {
      &:active {
        background: hsl(210, 30%, 89%);
        color: hsl(210, 13%, 30%);
        box-shadow: 0 0 0 ${borderSize} hsl(211, 87%, 80%);
      }
    }
  `}

  &:hover {
    border: 3px solid #0f70d7;
  }
`;

export const WarningIframeMessage = styled.p`
  color: #4e5a66;
  font-size: 0.875rem;
  font-style: italic;
  margin: .5rem 0 0 0;
`;

export const SendingButton = styled.input`
  border: 3px solid transparent;
  overflow: visible;
  display: inline-block;
  border-radius: 2px;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;

  &:hover {
    border: 3px solid #0f70d7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  padding: 0.45rem 1rem;
  background-color: #0f70d7;
  color: #fff;
  font-size: calc(1rem * 0.85);
`;

export const FormToSendUrl = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  width: 85%;
`;

export const FormWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-items: center;
`;

export const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  margin-Left: .5rem;
  width: 100%;
  height: 100%;
  align-items: flex-start;
  justify-items: flex-start;
`;

export const FormToSendUrlItem = styled.div<FormToSendUrlItemProps>`
  display: flex;
  ${({ isCheckboxItem }) => (
    isCheckboxItem
      ? css`
        flex-direction: row;
        align-items: center;
      `
      : css`
        flex-direction: column;
      `
  )}
  width: 100%;
`;

export const BottomSeparator = styled.div`
  position: relative;
  width: 100%;
  height: ${borderSizeSmall};
  align-self: center;
  background-color: ${colorGrayLightest};
  margin: calc(${lineHeightComputed} * 2) ${mdPaddingX} calc(${lineHeightComputed} * 1.75) ${mdPaddingX};
`;
