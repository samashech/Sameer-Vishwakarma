import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeInSection } from '../components/FadeInSection';
import { artData } from '../data/artData';
import '../components/Art.css';

const ArtGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const showPrev = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? artData.length - 1 : prev - 1));
  };

  const showNext = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === artData.length - 1 ? 0 : prev + 1));
  };

  const selectedPiece = selectedImageIndex !== null ? artData[selectedImageIndex] : null;

  return (
    <div className="art-gallery-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back
      </Link>
      
      <FadeInSection>
        <h1 className="section-heading">/ gallery</h1>
      </FadeInSection>

      <div className="gallery-grid">
        {artData.map((piece, i) => (
          <FadeInSection key={piece.id} delay={`${(i % 3) * 100}ms`}>
            <div className="gallery-card" onClick={() => openModal(i)}>
              <div className="gallery-img-wrapper">
                <img src={piece.src} alt={piece.alt} loading="lazy" />
              </div>
              <div className="gallery-info">
                <h3>{piece.title}</h3>
                <p>{piece.category}</p>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>

      {selectedPiece && (
        <div className="art-modal-overlay" onClick={closeModal}>
          <button className="modal-close" onClick={closeModal}>
            <X size={32} />
          </button>
          
          <button className="modal-prev" onClick={showPrev}>
            <ChevronLeft size={48} />
          </button>
          
          <div className="art-modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPiece.src} 
              alt={selectedPiece.alt} 
              className="art-modal-img" 
            />
            <div className="art-modal-info">
              <h3>{selectedPiece.title}</h3>
              <p>{selectedPiece.category}</p>
            </div>
          </div>
          
          <button className="modal-next" onClick={showNext}>
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtGallery;
