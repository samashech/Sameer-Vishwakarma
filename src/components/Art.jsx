import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FadeInSection } from './FadeInSection';
import { artData } from '../data/artData';
import './Art.css';

const Art = () => {
  // Select a subset for preview
  const previewPieces = artData.filter(piece => 
    ['sasuke', 'koenigsegg-gemera', 'ferrari-488'].includes(piece.id)
  );

  return (
    <section id="art" className="art-preview-section">
      <FadeInSection>
        <h2 className="section-heading">/ art</h2>
        <p className="art-intro">
          Outside of code, I draw — mostly cars and anime, in pencil and colored pencil.
        </p>
      </FadeInSection>

      <div className="art-grid">
        {previewPieces.map((piece, i) => (
          <FadeInSection key={piece.id} delay={`${i * 100}ms`}>
            <div className="art-card">
              <img src={piece.src} alt={piece.alt} className="art-image" loading="lazy" />
              <div className="art-overlay">
                <div className="art-overlay-content">
                  <h4>{piece.title}</h4>
                  <p>{piece.category}</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>

      <FadeInSection delay="300ms">
        <Link to="/art" className="explore-link">
          Explore collection <ArrowRight size={16} style={{ marginLeft: '8px' }} />
        </Link>
      </FadeInSection>
    </section>
  );
};

export default Art;
