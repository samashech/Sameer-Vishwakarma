const fs = require('fs');
const file = 'src/components/Art.jsx';
let code = fs.readFileSync(file, 'utf8');

const touchStates = `
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      showNext();
    }
    if (isRightSwipe) {
      showPrev();
    }
  };
`;

code = code.replace(
  "const openModal = (index) => {",
  touchStates + "\n  const openModal = (index) => {"
);

code = code.replace(
  '<div className="art-modal-overlay" onClick={closeModal}>',
  '<div className="art-modal-overlay" onClick={closeModal} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndEvent}>'
);

fs.writeFileSync(file, code);
