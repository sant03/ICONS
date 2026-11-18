package com.plastyfreddy.icons.sequence;

import com.plastyfreddy.icons.sequence.domain.Sequence;
import com.plastyfreddy.icons.sequence.domain.SequenceRepository;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SequenceService {

    private final SequenceRepository sequenceRepository;

    public SequenceService(SequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public String nextCode(String sequenceName) {
        Long tenantId = TenantContext.require();
        Sequence seq = sequenceRepository.findForUpdate(tenantId, sequenceName)
            .orElseThrow(() -> new IllegalStateException(
                "Secuencia '%s' no encontrada para tenant %d".formatted(sequenceName, tenantId)));

        String code = seq.getPrefix() + String.format("%0" + seq.getPadding() + "d", seq.getNextValue());
        seq.setNextValue(seq.getNextValue() + 1);
        return code;
    }
}
