package com.wataneya.chillout.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@GenericGenerator(name = "uuid", strategy = "uuid2")
@Table(name = "Trips")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class,property = "id")
public class Trip {

    @Id
    @GeneratedValue(generator = "uuid")
    private String id;

    private int day;

    private int month;

    private int year;

    private boolean isHidden;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REMOVE})
    @JsonIdentityReference(alwaysAsId = true)
    private Distance outboundDistance;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REMOVE})
    @JsonIdentityReference(alwaysAsId = true)
    private Distance inboundDistance;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REMOVE})
    @JsonIdentityReference(alwaysAsId = true)
    private Driver driver;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REMOVE})
    @JsonIdentityReference(alwaysAsId = true)
    private Vehicle vehicle;


    public Trip(){

    }

    public Trip(String id, int day, int month, int year, boolean isHidden, Distance outboundDistance, Distance inboundDistance, Driver driver, Vehicle vehicle) {
        this.id = id;
        this.day = day;
        this.month = month;
        this.year = year;
        this.isHidden = isHidden;
        this.outboundDistance = outboundDistance;
        this.inboundDistance = inboundDistance;
        this.driver = driver;
        this.vehicle = vehicle;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public boolean isHidden() {
        return isHidden;
    }

    public void setHidden(boolean hidden) {
        isHidden = hidden;
    }

    public Distance getOutboundDistance() {
        return outboundDistance;
    }

    public void setOutboundDistance(Distance outboundDistance) {
        this.outboundDistance = outboundDistance;
    }

    public Distance getInboundDistance() {
        return inboundDistance;
    }

    public void setInboundDistance(Distance inboundDistance) {
        this.inboundDistance = inboundDistance;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }
}