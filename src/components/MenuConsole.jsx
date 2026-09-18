"use client";

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const MenuContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  width: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' 
    : theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.25)' 
    : theme.shadows[2],
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[400],
    borderRadius: '3px',
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTopLeftRadius: theme.spacing(1),
  borderTopRightRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' 
    : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? 'none' 
    : '0 1px 2px rgba(0,0,0,0.03)',
}));

const HeaderText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.grey[400] 
    : theme.palette.grey[600],
  textTransform: 'uppercase',
}));

const RestaurantTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(0.5),
  textAlign: 'center',
}));

const RestaurantSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const SectionIcon = styled('span')(({ theme }) => ({
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const SectionText = styled(Typography)(({ theme }) => ({
  fontSize: '1.4rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
}));

const MenuItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  width: '100%',
}));

const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
  marginRight: theme.spacing(2),
  flex: 1,
}));

const MenuItemPrice = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  marginLeft: theme.spacing(2),
}));

const MenuItemDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  marginBottom: theme.spacing(1),
}));

const MenuItemDuration = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  marginBottom: theme.spacing(2.5),
  fontStyle: 'italic',
}));

const MenuNote = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontStyle: 'italic',
  marginTop: theme.spacing(2),
}));

const MenuConsole = () => {
  const theme = useTheme();

  return (
    <Box>
      <HeaderContainer>
        <HeaderText>Restaurant Menu</HeaderText>
      </HeaderContainer>
      <MenuContainer>
        <RestaurantTitle>MITI MITI</RestaurantTitle>
        <RestaurantSubtitle>MEXICAN CUISINE & CANTINA</RestaurantSubtitle>
        
        <SectionTitle>
          <SectionIcon>🌮</SectionIcon>
          <SectionText>APPETIZERS & SHARES</SectionText>
        </SectionTitle>
        
        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Potato Taquitos</MenuItemTitle>
            <MenuItemPrice>$9.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            3 pc crispy potato taquitos with sour cream, salsa verde, cotija cheese
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Wild Mushroom Croquetas</MenuItemTitle>
            <MenuItemPrice>$7.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Fried mushroom croquettes
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Mexican Street Corn</MenuItemTitle>
            <MenuItemPrice>$7.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled corn with chili powder, smoked spicy mayo, cotija cheese, cilantro
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Crispy Brussels Sprouts</MenuItemTitle>
            <MenuItemPrice>$11.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Brussels sprouts tossed in fish‑sauce vinaigrette with mint, peanuts, cilantro
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Roasted Cauliflower</MenuItemTitle>
            <MenuItemPrice>$11.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Roasted cauliflower with tahini & pomegranate molasses, chives
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Crab Cakes</MenuItemTitle>
            <MenuItemPrice>$15.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Pan‑fried crab cakes with lime zest & sweet peppers on chipotle mayo and mango‑cucumber salsa
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Queso Fundido</MenuItemTitle>
            <MenuItemPrice>$11.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Melted Mexican cheese blend, flour tortillas (add chorizo +$2, shrimp +$4, steak +$6)
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🥑</SectionIcon>
          <SectionText>CHIPS & NACHOS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Guacamole & Chips</MenuItemTitle>
            <MenuItemPrice>$14.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            House guacamole with corn tortilla chips
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Roasted Chili Mango Guacamole</MenuItemTitle>
            <MenuItemPrice>$16.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Guacamole with mango and roasted jalapeño, chives; chips
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Miti Crab Guacamole</MenuItemTitle>
            <MenuItemPrice>$18.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Guacamole topped with Maine crab meat, watermelon radish, jalapeño; chips
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Miti Nachos</MenuItemTitle>
            <MenuItemPrice>$18.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Nachos with jack cheese, black beans, salsa verde, pico, slaw, jalapeño, crema
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🍗</SectionIcon>
          <SectionText>DIRTY BIRDY CHICKEN WINGS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Naked Wings</MenuItemTitle>
            <MenuItemPrice>Half Dozen: $12.00 | Dozen: $22.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Plain fried wings (sauce on side)
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Mango Coconut Wings</MenuItemTitle>
            <MenuItemPrice>Half Dozen: $12.00 | Dozen: $22.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Wings tossed in mango‑coconut sauce
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Chipotle Pineapple Wings</MenuItemTitle>
            <MenuItemPrice>Half Dozen: $12.00 | Dozen: $22.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Wings tossed in chipotle‑pineapple glaze
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🧀</SectionIcon>
          <SectionText>QUESADILLAS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Cheese Quesadilla</MenuItemTitle>
            <MenuItemPrice>$10.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Jack cheese, pico & crema on side
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Mushroom, Zucchini & Corn Quesadilla</MenuItemTitle>
            <MenuItemPrice>$12.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Veggie quesadilla
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Steak Quesadilla</MenuItemTitle>
            <MenuItemPrice>$16.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Skirt steak
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🥗</SectionIcon>
          <SectionText>SALADS & SOUP</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Mexican Caesar Salad</MenuItemTitle>
            <MenuItemPrice>$12.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Romaine, avocado, pepitas, green olives, cotija, chipotle Caesar dressing
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Chayote Citrus Salad</MenuItemTitle>
            <MenuItemPrice>$13.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Chayote squash, orange, hearts of palm, radish, jicama, avocado, lime dressing
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🦞</SectionIcon>
          <SectionText>LANGOSTA FIESTA (LOBSTER SPECIALS)</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Lobster Guacamole</MenuItemTitle>
            <MenuItemPrice>$20.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Guac topped with lobster, citrus zest, smoky aioli, chives
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Lobster Taco</MenuItemTitle>
            <MenuItemPrice>$8.50</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Chilled lobster, chipotle aioli, red onion, corn, avocado in blue corn shell (1 pc)
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🌯</SectionIcon>
          <SectionText>BURRITOS & BOWLS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Vegan Burrito/Bowl</MenuItemTitle>
            <MenuItemPrice>$18.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Mushrooms, kale, sweet potato, rice & beans (spinach tortilla or bowl)
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Chicken Burrito/Bowl</MenuItemTitle>
            <MenuItemPrice>$19.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled chicken, jack cheese, rice & beans
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Steak Burrito/Bowl</MenuItemTitle>
            <MenuItemPrice>$21.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Skirt steak, jack cheese, rice & beans
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🌶️</SectionIcon>
          <SectionText>ENCHILADAS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Vegan Enchiladas</MenuItemTitle>
            <MenuItemPrice>$19.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Seasonal vegetables in corn tortillas with salsa verde; rice & beans
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Chicken Mole Enchiladas</MenuItemTitle>
            <MenuItemPrice>$23.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Roasted chicken tinga in corn tortillas with mole poblano, queso fresco, crema, onions
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🥘</SectionIcon>
          <SectionText>FAJITAS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Vegetable Fajitas</MenuItemTitle>
            <MenuItemPrice>$18.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Bell peppers, onions, mixed veggies; rice, beans, tortillas, guac, pico, crema
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Chicken Fajitas</MenuItemTitle>
            <MenuItemPrice>$20.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled chicken; same sides
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Skirt Steak Fajitas</MenuItemTitle>
            <MenuItemPrice>$24.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled skirt steak; same sides
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🥩</SectionIcon>
          <SectionText>ENTREES</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Skirt Steak</MenuItemTitle>
            <MenuItemPrice>$32.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled skirt steak with chimichurri and any 2 sides
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Grilled Salmon</MenuItemTitle>
            <MenuItemPrice>$30.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Grilled salmon filet with any 2 sides
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🌮</SectionIcon>
          <SectionText>MITI TACO FLIGHTS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>4 ft Long</MenuItemTitle>
            <MenuItemPrice>$69.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            10 tacos, choose any; feeds 3‑5
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>6 ft Longer</MenuItemTitle>
            <MenuItemPrice>$126.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            20 tacos (4 types × 5 each); feeds 5‑7
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🍹</SectionIcon>
          <SectionText>BEVERAGES</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Classic Margarita</MenuItemTitle>
            <MenuItemPrice>Glass: $12.00 | Pitcher: $54.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Tequila, triple sec, lime (frozen/on the rocks)
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Flavored Margarita</MenuItemTitle>
            <MenuItemPrice>Glass: $14.00 | Pitcher: $64.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Classic with choice flavor (hibiscus, tamarind, mango, passion fruit, strawberry, coconut, pineapple, lychee, jalapeño, lavender)
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Mexican Espresso Martini</MenuItemTitle>
            <MenuItemPrice>$13.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Tequila, Kahlúa, espresso, agave
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🍺</SectionIcon>
          <SectionText>BEERS & WINES</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Draft Beers</MenuItemTitle>
            <MenuItemPrice>Glass: $8.00-$9.00 | Pitcher: $28.00-$32.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Pacifico (Mexican Lager), Modelo Especial (Pilsner), Negra Modelo (Dark Lager), Ballast Point Sculpin (IPA)
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>House Wines</MenuItemTitle>
            <MenuItemPrice>Glass: $8.00-$12.00 | Bottle: $32.00-$45.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Cabernet (California), Malbec (Argentina), Pinot Grigio (Italy), Sauvignon Blanc (Chile), Rosé (Spain)
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🍖</SectionIcon>
          <SectionText>BIRRIA SPECIALS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Birria Tacos</MenuItemTitle>
            <MenuItemPrice>2pc: $16.00 | 2pc Meal: $20.00 | 3pc: $28.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Braised beef birria, jack cheese, onion, cilantro, salsa verde; consomé dip
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Birria Quesadilla</MenuItemTitle>
            <MenuItemPrice>$18.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Flour tortilla, birria, jack cheese, onion, cilantro; consomé dip
          </MenuItemDescription>
        </Box>

        <SectionTitle>
          <SectionIcon>🍰</SectionIcon>
          <SectionText>DESSERTS</SectionText>
        </SectionTitle>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Tres Leches Cake</MenuItemTitle>
            <MenuItemPrice>$10.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Three‑milk cake slice with hint of almond
          </MenuItemDescription>
        </Box>

        <Box position="relative" mb={2}>
          <MenuItemRow>
            <MenuItemTitle>Churros</MenuItemTitle>
            <MenuItemPrice>$8.00</MenuItemPrice>
          </MenuItemRow>
          <MenuItemDescription>
            Cinnamon‑sugar pastry sticks with chocolate sauce
          </MenuItemDescription>
        </Box>

        <MenuNote>
          Happy Hour: Mon-Thu 11 AM-Close; Fri 11 AM-7 PM (not holidays)
        </MenuNote>
      </MenuContainer>
    </Box>
  );
};

export default MenuConsole; 