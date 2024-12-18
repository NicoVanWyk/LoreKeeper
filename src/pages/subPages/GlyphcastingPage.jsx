import React from 'react';
import styles from '../css/MagicPage.module.css';
// Image Imports
import FullGlyph from '../../assets/Magic/FullGlyph.png';
import CompactGlyph from '../../assets/Magic/CompactGlyph.png';
import GlyphDuration from '../../assets/Magic/GlyphDuration.png';
import GlyphSize from '../../assets/Magic/GlyphSize.png';
import GlyphShape from '../../assets/Magic/GlyphShape.png';
import GlyphCount from '../../assets/Magic/GlyphCount.png';
import GlyphElementTrigger from '../../assets/Magic/GlyphTriggerAndSymbol.png'
import GlyphExample from '../../assets/Magic/GlyphExample.png'

function GlyphcastingPage() {
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                {/* Introduction */}
                <h1>What Is Glyphcasting?</h1>
                <p>
                    Glyphcasting was revolutionised and standardised by the Fen'Hisan Empire during the 4th Era. While offshoots exist, the core of the technique
                    remains remarkably similar to the original. It has undergone many revisions and changes, morphing and adapting to the needs of mages across Irea.
                </p>
            </div>

            <div className={styles.section}>
                {/* Casting using Glyphs */}
                <h1>Casting using Glyphs</h1>
                <p>
                    Glyphs use shapes and symbols to cast spells instead of a mage's willpower. Mages still require Power to cast these spells, but they will find it
                    much easier than using Forcecasting, even if it is slower.
                </p>

                {/* Anatomy */}
                <h2>Anatomy of a Glyphcasted Spell</h2>
                <p>
                    A Glyphcasted Spell can take two forms: a full Glyph, which has more space for direct modifications, and a compact Glyph.. The compacted Glyph is
                    useful when spells are modified through Chaining.
                </p>

                {/* --Full & Compact Glyphs */}
                <div className='row' style={{ justifySelf: 'center' }}>
                    <div className='column textCenter'>
                        <h3 className='font_24'>Full Glyph</h3>
                        <img src={FullGlyph} alt="Full Glyph" style={{ width: '250px' }} />
                    </div>

                    <div className='column textCenter'>
                        <h3 className='font_24'>Compact Glyph</h3>
                        <img src={CompactGlyph} alt="Full Glyph" style={{ width: '250px' }} />
                    </div>
                </div>

                {/* --Duration */}
                <h3 className='textCenter font_28'>Duration</h3>
                <p>
                    Duration is controlled by the following portion of the Glyph - the more geometry, the longer the duration:
                </p>

                <div className='row' style={{ justifySelf: 'center' }}>
                    <img src={GlyphDuration} alt="Glyph Duration" style={{ width: '350px' }} />
                </div>

                {/* --Size & Shape */}
                <h3 className='textCenter font_28'>Size & Shape</h3>
                <p>
                    The Glyph's size is controlled by the amount of geometry, however the shape will be a three dimensional representation of the shape drawn.
                </p>

                <div className='row' style={{ justifySelf: 'center' }}>
                    <div className='column textCenter'>
                        <h3 className='font_24'>Size</h3>
                        <img src={GlyphSize} alt="Full Glyph" style={{ width: '350px' }} />
                    </div>

                    <div className='column textCenter'>
                        <h3 className='font_24'>Shape</h3>
                        <img src={GlyphShape} alt="Full Glyph" style={{ width: '350px' }} />
                    </div>
                </div>

                {/* --Projectile Count */}
                <h3 className='textCenter font_28'>Projectile Count</h3>
                <p>
                    The amount of small straight lines control the amount of projectiles. This is a very easy way to make a spell much more powerful, as well as
                    harder to cast as each projectile takes the same amount of power to cast:
                </p>

                <div className='row' style={{ justifySelf: 'center' }}>
                    <img src={GlyphCount} alt="Glyph Duration" style={{ width: '350px' }} />
                </div>

                {/* --Element & Trigger */}
                <h3 className='textCenter font_28'>Element & Trigger</h3>
                <p>
                    The element a spell uses is represented by a symbol in the center of the Glyph. The trigger is below it, and alters when a spell is triggered.
                </p>

                <div className='row' style={{ justifySelf: 'center' }}>
                    <img src={GlyphElementTrigger} alt="Glyph Duration" style={{ width: '350px' }} />
                </div>

                {/* --Example Spell */}
                <h3 className='textCenter font_28'>Example Spell</h3>
                <p>
                    An example of a spell that instantly creates a single, small projectile of fire that resembles an arrow, which can travel a long distance before
                    dissipating:
                </p>

                <div className='row' style={{ justifySelf: 'center' }}>
                    <img src={GlyphExample} alt="Glyph Duration" style={{ width: '350px' }} />
                </div>

                {/* --Other Geometry */}
                <h3 className='textCenter font_28'>Other Geometry</h3>
                <p>
                    While the geometry above is the standard for casting a spell, the shapes used to contain the spell's properties can be swapped out according to
                    personal preference.
                </p>

            </div>
        </div>
    )
}

export default GlyphcastingPage