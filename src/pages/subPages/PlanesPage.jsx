// Base Imports
import React from 'react';
// CSS Import
import styles from '../css/MagicPage.module.css';

function PlanesPage() {
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                {/* Introduction */}
                <h1>What Are Planes?</h1>
                <p>
                    Planes are layer of reality stacked on top of one another. Each reflects an altered image of the First Plane, commonly called Reality, with each layer farther becoming more
                    altered than the last. There are five commonly accepted planes:

                    <ol>
                        <li>First Plane</li>
                        <li>The Infernal</li>
                        <li>The Abyss</li>
                        <li>The Reach</li>
                        <li>Planes of Krosis</li>
                    </ol>
                </p>
            </div>

            <div className={styles.section}>
                {/* First Plane */}
                <h1>The First Plane</h1>
                <p>
                    The First Plane is commonly thought to be the base of reality. Each plane following the First Plane seems like an altered copy. The farther you move from the First Plane, the
                    less those planes resemble it. The First Plane is mainly overseen by Gods.
                </p>
            </div>

            <div className={styles.section}>
                {/* The Infernal */}
                <h1>The Infernal</h1>
                <p>
                    The Infernal is home to Devils, Archdevils, etc.

                    The Infernal is also home to sinners who have not yet redeemed themselves, and as such cannot move on to The Abyss or The Reach.

                    There are 13 domains within The Infernal, all of which are stretches of land floating in an arcane sea the Devils traverse through their highly sophisticated knowledge of teleportation
                    systems. The Infernal closely resembles the First Plane.

                    The Domains are as such:

                    1. Lust
                    2. Wrath (Violence, war)
                    3. Pride
                    4. Indulgence (Food, Drink, Partying, Not Dependence)
                    5. Envy (Want what others have)
                    6. Greed (Refusal to share what you have)
                    7. Sloth (Willing apathy or lack of care)
                    8. Addiction (Substances, Rivalries, Dependence)
                    9. Deceit
                    10. Negligence
                    11. Prejudice (Hate, both violent and non-violent)
                    12. Fallacy (Actions committed under false beliefs despite evidence against them)
                    13. Desperation (Actions committed under the belief of having no choice)

                    The Infernal is overseen by Archdevils, who are comparable to First Plane Gods in function and power. Archdevils commonly have a strict need to follow rules and laws - which can only be
                    changed through long and complex debates. They have no wish to leave The Infernal and are appointed to punishing, redeeming and rehabilitating souls that appear in each domain.
                </p>
            </div>

            <div className={styles.section}>
                {/* The Abyss */}
                <h1>The Abyss</h1>
                <p>
                    The Abyss is home to Demons, Archdemons, etc.

                    The Abyss is also home to sinners who have redeemed themselves in The Infernal, but are unwilling or unable to enter The Reach. The Infernal and the Abyss are commonly grouped together
                    and called Hell.

                    There are 13 domains within The Abyss, which are stretches of land floating in an arcane sea the Demons traverse through magically powered machines similar to carriages. The Abyss resembles
                    the First Plane, however the alterations are large enough to provoke a constant feeling of unease similar to the Uncanny Valley Effect.

                    The Domains are the same as the Infernal.

                    Archdemons rule over the Abyss similar to how Archdevils rule over the Infernal. Archdemons also commonly have some of their living followers enter their domains to more closely serve them, 
                    and they are also known to have their dead followers enter an afterlife inside their domains, similar to Irean gods.

                    They are also very adaptive, and prefer to push the rules rather than follow them. While Irean gods actively try to stop mortals from reaching godhood, Archdemons actively encourage it. They saved 
                    the lives of many prospective Mage-Gods without them ever realizing it, standing in direct opposition to the wills of the Irean gods who fear mortals reaching godhood. 

                    The inhabitants of the Abyss, Archdemons included, seem to be aware of the fact that the Abyss is an altered version of the First Plane. They also feel the same sense of unease that inhabitants 
                    of the First Plane feel in the Abyss. Despite this implying they were once inhabitants of the First Plane, the denizens of the Abyss can only survive on the First Plane for prolonged periods of 
                    time with the help of certain enchantments or artifacts, such as Hadria's Heart. This constant sense of unease towards their home plane has caused many Demonic Invasions, however the majority of 
                    Irea is either unaware or uncaring towards this, seeing the invasions as attempts to conquer and destroy that which the Abyss cannot have or be. 
                </p>
            </div>

            <div className={styles.section}>
                {/* The Reach */}
                <h1>The Reach</h1>
                <p>
                    The Reach is home to Angels, Archangels, etc.

                    The Reach is also home to sinners who have redeemed themselves, and have moved on from The Abyss, but do not wish to move to another afterlife. The reach is seen as the generic afterlife, where
                    no god has reign over it, only the Archangels.

                    There are 13 domains within the Reach, which are stretches of land floating in an arcane sea the Angels traverse through the use of highly advanced flying machinery. The Reach is so far removed from
                    the First Plane that the resemblance is not easily spotted.

                    The Domains are the same as the Infernal.

                    Archangels, who function similarly to Archdevils and Archdemons, oversee the Reach. They guide souls to either remain in the Reach or move on to the afterlife of each of their religions.
                </p>
            </div>

            <div className={styles.section}>
                {/* Plane of Krosis */}
                <h1>The Planes of Krosis</h1>
                <p>
                    The Planes of Krosis is a generic term used to refer to any plane that is farther removed from the First Plane than the Reach. These planes are unrecognisable from the First Plane, with so many alterations
                    that it is incredibly difficult to find similarities. The most well known plane is that of the ancient god Krosis, which was created when the god supposedly peered beyond the veil of reality itself. As such,
                    Krosis teaches that its plane sits before the First Plane, but this teaching is often ignored in academic spaces as mad ramblings, given Krosis' followers being consistently driven mad by the knowledge it grants
                    them.
                </p>
            </div>
        </div>
    )
}

export default PlanesPage