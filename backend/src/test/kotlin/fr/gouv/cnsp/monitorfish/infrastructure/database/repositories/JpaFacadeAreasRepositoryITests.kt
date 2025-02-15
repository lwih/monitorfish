package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaFacadeAreasRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    @Test
    @Transactional
    fun `findByIncluding Should return the facade NAMO including the specified point geometry`() {
        // When
        val point = GeometryFactory().createPoint(Coordinate(-4.156, 47.325))
        val faoAreas = facadeAreasRepository.findByIncluding(point)

        // Then
        assertThat(faoAreas).hasSize(1)
        assertThat(faoAreas.first().facade).isEqualTo("NAMO")
        assertThat(faoAreas.last().geometry).isNotNull()
    }

    @Test
    @Transactional
    fun `findByIncluding Should return the facade MEMN including the specified point geometry`() {
        // When
        val point = GeometryFactory().createPoint(Coordinate(-10.85, 53.35))
        val faoAreas = facadeAreasRepository.findByIncluding(point)

        // Then
        assertThat(faoAreas).hasSize(1)
        assertThat(faoAreas.first().facade).isEqualTo("MEMN")
        assertThat(faoAreas.last().geometry).isNotNull()
    }
}
