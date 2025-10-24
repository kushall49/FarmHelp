"""
Fertilizer and Treatment Recommendation System
Matches disease → fertilizer suggestions with safety notes
"""
import csv
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class FertilizerRecommender:
    """
    Recommend fertilizers and treatments based on crop and disease
    """
    
    # Safety disclaimer
    DISCLAIMER = (
        "⚠️ DISCLAIMER: These recommendations are for informational purposes only. "
        "Always consult with a licensed agricultural expert or extension service "
        "before applying any chemicals or fertilizers. Follow all local regulations "
        "and safety guidelines. The effectiveness of treatments may vary based on "
        "environmental conditions, disease severity, and crop variety."
    )
    
    def __init__(self, fertilizers_csv_path: str = None):
        """
        Initialize recommender
        
        Args:
            fertilizers_csv_path: Path to fertilizers.csv database
        """
        self.fertilizers_csv_path = fertilizers_csv_path or 'data/fertilizers.csv'
        self.fertilizers_db = []
        self._load_database()
    
    def _load_database(self):
        """Load fertilizers database from CSV"""
        try:
            csv_path = Path(self.fertilizers_csv_path)
            
            if not csv_path.exists():
                logger.warning(f"Fertilizers CSV not found: {csv_path}")
                self._create_default_database()
                return
            
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                self.fertilizers_db = list(reader)
            
            logger.info(f"Loaded {len(self.fertilizers_db)} fertilizer entries from CSV")
            
        except Exception as e:
            logger.error(f"Failed to load fertilizers database: {str(e)}")
            self._create_default_database()
    
    def _create_default_database(self):
        """Create minimal in-memory database if CSV not found"""
        self.fertilizers_db = [
            {
                'id': '1',
                'name': 'NPK 20-20-20',
                'disease': 'late_blight',
                'crop': 'tomato',
                'dosage': '25g/plant',
                'notes': 'General purpose balanced fertilizer',
                'legal_status': 'OK',
                'safety_warning': 'Wear gloves during application'
            },
            {
                'id': '2',
                'name': 'Copper Fungicide',
                'disease': 'late_blight',
                'crop': 'tomato',
                'dosage': '2-3 tbsp/gallon',
                'notes': 'Effective fungicide for blight control',
                'legal_status': 'OK',
                'safety_warning': 'Avoid contact with skin'
            },
            {
                'id': '3',
                'name': 'Neem Oil',
                'disease': 'late_blight',
                'crop': 'tomato',
                'dosage': '10ml/L',
                'notes': 'Organic option, safe for beneficial insects',
                'legal_status': 'OK',
                'safety_warning': 'Safe for organic farming'
            }
        ]
        logger.info("Using default fertilizer database")
    
    def get_recommendations(self, crop: str, disease: str, top_n: int = 3) -> Dict[str, Any]:
        """
        Get fertilizer recommendations for crop and disease
        
        Args:
            crop: Crop name (e.g., "Tomato")
            disease: Disease name (e.g., "Late Blight")
            top_n: Number of recommendations to return
            
        Returns:
            Dictionary with recommendations and disclaimer
        """
        try:
            # Normalize inputs
            crop_normalized = crop.lower().strip()
            disease_normalized = disease.lower().replace(' ', '_').strip()
            
            logger.info(f"Finding recommendations for {crop} - {disease}")
            
            # Find exact matches
            exact_matches = self._find_matches(crop_normalized, disease_normalized, exact=True)
            
            # If not enough, find partial matches
            if len(exact_matches) < top_n:
                partial_matches = self._find_matches(crop_normalized, disease_normalized, exact=False)
                # Combine and deduplicate
                all_matches = exact_matches + [m for m in partial_matches if m not in exact_matches]
            else:
                all_matches = exact_matches
            
            # If still no matches, find crop-specific or healthy recommendations
            if len(all_matches) == 0:
                fallback_matches = self._find_fallback_matches(crop_normalized)
                all_matches = fallback_matches
            
            # Limit to top_n
            top_matches = all_matches[:top_n]
            
            # Format recommendations
            recommendations = []
            for match in top_matches:
                recommendations.append({
                    'id': match.get('id', ''),
                    'name': match.get('name', ''),
                    'dosage': match.get('dosage', ''),
                    'notes': match.get('notes', ''),
                    'legal': match.get('legal_status', 'UNKNOWN'),
                    'safety_warning': match.get('safety_warning', 'Follow label instructions'),
                    'application_method': self._get_application_method(match)
                })
            
            # Build response
            response = {
                'crop': crop,
                'disease': disease,
                'recommendations': recommendations,
                'total_found': len(all_matches),
                'showing': len(recommendations),
                'disclaimer': self.DISCLAIMER,
                'additional_advice': self._get_additional_advice(crop, disease)
            }
            
            logger.info(f"Found {len(recommendations)} recommendations")
            return response
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {str(e)}", exc_info=True)
            return self._get_error_response(crop, disease)
    
    def _find_matches(self, crop: str, disease: str, exact: bool = True) -> List[Dict]:
        """
        Find matching fertilizers
        
        Args:
            crop: Normalized crop name
            disease: Normalized disease name
            exact: If True, require exact match; if False, allow partial
            
        Returns:
            List of matching fertilizer records
        """
        matches = []
        
        for fertilizer in self.fertilizers_db:
            fert_crop = fertilizer.get('crop', '').lower().strip()
            fert_disease = fertilizer.get('disease', '').lower().strip()
            
            if exact:
                # Exact match
                if fert_crop == crop and fert_disease == disease:
                    matches.append(fertilizer)
            else:
                # Partial match (crop OR disease)
                if fert_crop == crop or fert_disease == disease:
                    matches.append(fertilizer)
        
        # Sort by legal status (OK first) and then by name
        matches.sort(key=lambda x: (
            0 if x.get('legal_status', '') == 'OK' else 1,
            x.get('name', '')
        ))
        
        return matches
    
    def _find_fallback_matches(self, crop: str) -> List[Dict]:
        """
        Find general recommendations for crop (healthy plants)
        
        Args:
            crop: Normalized crop name
            
        Returns:
            List of general fertilizer recommendations
        """
        matches = []
        
        for fertilizer in self.fertilizers_db:
            fert_crop = fertilizer.get('crop', '').lower().strip()
            fert_disease = fertilizer.get('disease', '').lower().strip()
            
            # Match crop with "healthy" disease status
            if fert_crop == crop and fert_disease == 'healthy':
                matches.append(fertilizer)
        
        # If still no matches, return general fertilizers
        if len(matches) == 0:
            for fertilizer in self.fertilizers_db:
                if fertilizer.get('legal_status') == 'OK':
                    matches.append(fertilizer)
                    if len(matches) >= 3:
                        break
        
        return matches
    
    def _get_application_method(self, fertilizer: Dict) -> str:
        """
        Determine application method from fertilizer type
        
        Args:
            fertilizer: Fertilizer record
            
        Returns:
            Application method string
        """
        name = fertilizer.get('name', '').lower()
        
        if 'spray' in name or 'foliar' in name or 'oil' in name:
            return 'Foliar spray - apply to leaves'
        elif 'soil' in name or 'gypsum' in name or 'compost' in name:
            return 'Soil application - apply to root zone'
        elif 'fungicide' in name or 'neem' in name:
            return 'Spray application - cover all plant surfaces'
        elif 'npk' in name or 'fertilizer' in name:
            return 'Soil or foliar - follow label instructions'
        else:
            return 'Follow product label for application method'
    
    def _get_additional_advice(self, crop: str, disease: str) -> List[str]:
        """
        Get additional advice based on crop and disease
        
        Args:
            crop: Crop name
            disease: Disease name
            
        Returns:
            List of advice strings
        """
        advice = [
            "Monitor plants regularly for early detection",
            "Remove and destroy infected plant material",
            "Ensure proper spacing for air circulation",
            "Water at soil level to keep foliage dry"
        ]
        
        # Disease-specific advice
        disease_lower = disease.lower()
        if 'blight' in disease_lower:
            advice.extend([
                "Apply fungicides preventively, not after infection",
                "Avoid overhead irrigation",
                "Rotate crops to reduce pathogen buildup"
            ])
        elif 'bacterial' in disease_lower:
            advice.extend([
                "Use disease-free seeds and transplants",
                "Disinfect tools between plants",
                "Copper-based products may help"
            ])
        elif 'mold' in disease_lower or 'mildew' in disease_lower:
            advice.extend([
                "Improve ventilation around plants",
                "Reduce humidity if growing in greenhouse",
                "Apply sulfur-based fungicides"
            ])
        
        return advice
    
    def _get_error_response(self, crop: str, disease: str) -> Dict[str, Any]:
        """
        Return error response with general advice
        
        Args:
            crop: Crop name
            disease: Disease name
            
        Returns:
            Error response dictionary
        """
        return {
            'crop': crop,
            'disease': disease,
            'recommendations': [
                {
                    'name': 'General Purpose NPK Fertilizer',
                    'dosage': 'Follow label instructions',
                    'legal': 'OK',
                    'notes': 'Consult local agricultural extension service',
                    'safety_warning': 'Use protective equipment'
                }
            ],
            'total_found': 0,
            'showing': 1,
            'disclaimer': self.DISCLAIMER,
            'additional_advice': [
                'Consult a licensed agronomist',
                'Contact your local agricultural extension office',
                'Get proper disease diagnosis before treatment'
            ]
        }
    
    def get_fertilizer_by_id(self, fertilizer_id: str) -> Optional[Dict[str, Any]]:
        """
        Get specific fertilizer by ID
        
        Args:
            fertilizer_id: Fertilizer ID
            
        Returns:
            Fertilizer record or None
        """
        for fertilizer in self.fertilizers_db:
            if fertilizer.get('id') == fertilizer_id:
                return fertilizer
        return None
    
    def search_by_name(self, name: str) -> List[Dict[str, Any]]:
        """
        Search fertilizers by name
        
        Args:
            name: Fertilizer name (partial match)
            
        Returns:
            List of matching fertilizers
        """
        name_lower = name.lower()
        matches = []
        
        for fertilizer in self.fertilizers_db:
            fert_name = fertilizer.get('name', '').lower()
            if name_lower in fert_name:
                matches.append(fertilizer)
        
        return matches
    
    def get_all_crops(self) -> List[str]:
        """Get list of all crops in database"""
        crops = set()
        for fertilizer in self.fertilizers_db:
            crop = fertilizer.get('crop', '').strip()
            if crop:
                crops.add(crop.title())
        return sorted(list(crops))
    
    def get_all_diseases(self) -> List[str]:
        """Get list of all diseases in database"""
        diseases = set()
        for fertilizer in self.fertilizers_db:
            disease = fertilizer.get('disease', '').strip()
            if disease and disease != 'healthy':
                diseases.add(disease.replace('_', ' ').title())
        return sorted(list(diseases))


# Singleton instance
fertilizer_recommender = FertilizerRecommender()
