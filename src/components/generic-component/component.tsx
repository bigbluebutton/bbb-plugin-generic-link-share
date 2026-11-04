import * as React from 'react';
import Iframe from 'react-iframe';
import * as Styled from './styles';

interface GenericComponentLinkShareProps {
  link: string;
  // Only given to the presenter, who may stop sharing from the content itself
  onClose?: () => void;
}

function GenericComponentLinkShare(props: GenericComponentLinkShareProps): React.ReactElement {
  const { link, onClose } = props;

  return (
    <div style={{
      background: 'white',
      width: '100%',
      height: '100%',
      position: 'relative',
    }}
    >
      <Iframe
        url={link}
        width="100%"
        height="100%"
        display="block"
        position="relative"
      />
      {onClose && (
        <Styled.CloseButton
          type="button"
          onClick={onClose}
          aria-label="Stop sharing website"
          title="Stop sharing website"
          data-test="stopGenericLinkShare"
        >
          <i className="icon-bbb-close" />
        </Styled.CloseButton>
      )}
    </div>
  );
}

GenericComponentLinkShare.defaultProps = {
  onClose: undefined,
};

export default GenericComponentLinkShare;
